
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Updated credit values to match the pricing constants
const SUBSCRIPTION_CREDITS = {
  "essentials": 550,
  "creator-pro": 3100,
  "studio-pro": 5000,
};

// Price ID mapping to plan IDs - Updated with correct price IDs
const PRICE_TO_PLAN_MAP = {
  "price_1RTBqlRuznwovkUGacCIEldb": "essentials",
  "price_1RTBsBRuznwovkUGRCA7YY3m": "creator-pro"
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
    
    console.log("=== SUBSCRIPTION CHECK START ===");
    console.log("Checking subscription for user:", userId);
    
    // Get user email from Supabase auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) {
      console.log("Error getting user data:", userError);
      throw new Error("Could not retrieve user email");
    }
    
    const userEmail = userData.user.email;
    console.log("User email:", userEmail);
    
    try {
      // Search for customer by email
      console.log("Searching for Stripe customer with email:", userEmail);
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 10, // Increased limit to catch more results
      });
      
      console.log(`Found ${customers.data.length} customers for email ${userEmail}`);
      
      if (customers.data.length === 0) {
        console.log("No Stripe customer found for this email");
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
      
      // Check all customers for active subscriptions
      for (const customer of customers.data) {
        console.log(`Checking customer ${customer.id} for active subscriptions`);
        
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 10,
        });
        
        console.log(`Customer ${customer.id} has ${subscriptions.data.length} total subscriptions`);
        
        // Look for active or trialing subscriptions
        const activeSubscriptions = subscriptions.data.filter(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        );
        
        console.log(`Found ${activeSubscriptions.length} active/trialing subscriptions for customer ${customer.id}`);
        
        if (activeSubscriptions.length > 0) {
          const subscription = activeSubscriptions[0];
          const priceId = subscription.items.data[0].price.id;
          
          console.log("=== ACTIVE SUBSCRIPTION FOUND ===");
          console.log("Subscription ID:", subscription.id);
          console.log("Customer ID:", customer.id);
          console.log("Status:", subscription.status);
          console.log("Price ID:", priceId);
          console.log("Current period end:", new Date(subscription.current_period_end * 1000).toISOString());
          
          // Map price ID to plan ID
          let planId = PRICE_TO_PLAN_MAP[priceId as keyof typeof PRICE_TO_PLAN_MAP];
          
          if (!planId) {
            console.log("Price ID not in mapping, determining from amount");
            const price = subscription.items.data[0].price;
            const amount = price.unit_amount || 0;
            console.log("Price amount (cents):", amount);
            
            if (amount === 3500) { // $35.00 for essentials
              planId = "essentials";
              console.log("Mapped to essentials plan based on $35 amount");
            } else if (amount === 20000) { // $200.00 for creator-pro
              planId = "creator-pro";
              console.log("Mapped to creator-pro plan based on $200 amount");
            } else {
              console.log(`Unknown price amount ${amount}, defaulting to starter`);
              planId = "starter";
            }
          } else {
            console.log(`Mapped price ID ${priceId} to plan ${planId}`);
          }
          
          // Sync with database
          try {
            const { error: upsertError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                plan_id: planId,
                status: subscription.status,
                subscription_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
                subscription_end: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
                amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
                monthly_credits: SUBSCRIPTION_CREDITS[planId as keyof typeof SUBSCRIPTION_CREDITS] || 0,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id' });
            
            if (upsertError) {
              console.error("Database sync error:", upsertError);
            } else {
              console.log("Successfully synced subscription to database");
            }
          } catch (dbError) {
            console.error("Database operation failed:", dbError);
          }
          
          console.log("=== RETURNING SUBSCRIPTION DATA ===");
          console.log("Plan ID:", planId);
          console.log("Status:", subscription.status);
          
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
      }
      
      console.log("No active subscriptions found across all customers");
      
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
    }

    // Check database as final fallback
    console.log("Checking database for subscription record");
    const { data: subscriptionData, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!dbError && subscriptionData) {
      console.log("Found subscription in database:", subscriptionData);
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

    console.log("=== NO SUBSCRIPTION FOUND - RETURNING STARTER ===");
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
    console.error("=== FUNCTION ERROR ===");
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
