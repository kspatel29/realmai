
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    try {
      // First check if subscription exists in our database
      const { data: subscriptionData, error: dbError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!dbError && subscriptionData) {
        // Return subscription from database
        return new Response(
          JSON.stringify({
            subscription: {
              planId: subscriptionData.plan_id,
              status: subscriptionData.status,
              currentPeriodEnd: subscriptionData.subscription_end,
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // If no subscription in database, check Stripe as fallback
      // Transform userId to Stripe customer ID format
      const customerId = `cus_${userId.replace(/-/g, '')}`;
      
      // First check if customer exists in Stripe
      const customer = await stripe.customers.retrieve(customerId);
      
      if (customer.deleted) {
        // Return default subscription for deleted customers
        return new Response(
          JSON.stringify({
            subscription: {
              planId: "starter",
              status: "active",
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
      // Get customer's subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });
      
      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        // Get the price ID to determine plan
        const priceId = subscription.items.data[0].price.id;
        
        // Map price ID to plan ID
        let planId = "starter"; // Default
        if (priceId.includes("essentials")) {
          planId = "essentials";
        } else if (priceId.includes("creator-pro")) {
          planId = "creator-pro";
        } else if (priceId.includes("studio-pro")) {
          planId = "studio-pro";
        }
        
        // Sync with database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: subscription.status,
            subscription_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
            amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
            monthly_credits: planId === "essentials" ? 500 : planId === "creator-pro" ? 1500 : planId === "studio-pro" ? 5000 : 0,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        
        return new Response(
          JSON.stringify({
            subscription: {
              planId: planId,
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    } catch (error) {
      console.log("Error retrieving subscription:", error);
      // If there's an error, we'll return the default subscription
    }

    // Return default subscription if no active subscription found
    return new Response(
      JSON.stringify({
        subscription: {
          planId: "starter",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error getting subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
