
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan to price ID mapping
const PLAN_PRICE_MAP = {
  "essentials": "price_1RTBqlRuznwovkUGacCIEldb",
  "creator-pro": "price_1RTBsBRuznwovkUGRCA7YY3m",
  "studio-pro": "price_REPLACE_WITH_STUDIO_PRO_PRICE_ID",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { userId, newPlanId } = await req.json();
    
    if (!userId || !newPlanId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID or plan ID" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Changing subscription plan for user: ${userId} to plan: ${newPlanId}`);

    // Get the price ID for the new plan
    const newPriceId = PLAN_PRICE_MAP[newPlanId as keyof typeof PLAN_PRICE_MAP];
    if (!newPriceId || newPriceId.includes("REPLACE_WITH")) {
      throw new Error(`No price ID configured for plan: ${newPlanId}`);
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) {
      throw new Error("Could not retrieve user email");
    }

    const userEmail = userData.user.email;

    // Find Stripe customer
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found");
    }

    const customerId = customers.data[0].id;

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }

    const subscription = subscriptions.data[0];
    const subscriptionItemId = subscription.items.data[0].id;

    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscriptionItemId,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    console.log(`Subscription ${subscription.id} updated to plan ${newPlanId}`);

    // Update database
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        plan_id: newPlanId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating subscription in database:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription: {
          id: updatedSubscription.id,
          plan_id: newPlanId,
          status: updatedSubscription.status,
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error changing subscription plan:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
