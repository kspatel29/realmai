import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define monthly credits for each subscription plan
const SUBSCRIPTION_CREDITS = {
  "essentials": 500,
  "creator-pro": 1500,
  "studio-pro": 5000,
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
    
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing session ID" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Verifying checkout session: ${sessionId}`);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      console.log(`Payment not completed, status: ${session.payment_status}`);
      return new Response(
        JSON.stringify({ success: false, status: session.status, message: "Payment not completed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const userId = session.client_reference_id;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID in session" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Processing payment for user: ${userId}, mode: ${session.mode}`);

    // Handle different session types based on mode and metadata
    if (session.mode === 'payment' && session.metadata?.type === 'credit_purchase') {
      const creditAmount = parseInt(session.metadata.credits, 10);
      
      if (!creditAmount) {
        return new Response(
          JSON.stringify({ error: "Invalid credit amount in session metadata" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Get the user's current credits
      const { data: userCredits, error: fetchError } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1);
      
      if (fetchError) {
        throw new Error(`Error fetching user credits: ${fetchError.message}`);
      }
      
      if (!userCredits || userCredits.length === 0) {
        // Create new credit record if none exists
        const { data: newCredits, error: createError } = await supabase.rpc("create_user_credits", {
          user_id_param: userId,
          credits_balance_param: creditAmount
        });
        
        if (createError) {
          throw new Error(`Error creating user credits: ${createError.message}`);
        }
      } else {
        // Update existing credit record
        const latestCredit = userCredits[0];
        const newBalance = latestCredit.credits_balance + creditAmount;
        
        const { error: updateError } = await supabase
          .from("user_credits")
          .update({ 
            credits_balance: newBalance, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", latestCredit.id);
        
        if (updateError) {
          throw new Error(`Error updating user credits: ${updateError.message}`);
        }
      }
      
      // Create a record of the transaction
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount: creditAmount,
          type: "purchase",
          package_id: session.metadata.packageId,
          description: `Purchased ${creditAmount} credits via Checkout`
        });
      
      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        // Continue even if transaction recording fails
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          type: 'credit_purchase',
          credits: creditAmount,
          message: `Successfully purchased ${creditAmount} credits`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (session.mode === 'subscription') {
      // Handle subscription purchase
      console.log("Processing subscription payment");
      
      // Get subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0].price.id;
      
      console.log(`Subscription created with price ID: ${priceId}`);
      
      // Determine subscription plan from price ID
      let subscriptionPlanId = "starter";
      let monthlyCredits = 0;
      
      if (priceId === "price_1RTBqlRuznwovkUGacCIEldb") {
        subscriptionPlanId = "essentials";
        monthlyCredits = SUBSCRIPTION_CREDITS.essentials;
      } else if (priceId === "price_1RTBsBRuznwovkUGRCA7YY3m") {
        subscriptionPlanId = "creator-pro";
        monthlyCredits = SUBSCRIPTION_CREDITS["creator-pro"];
      }
      
      console.log(`Subscription plan: ${subscriptionPlanId}, Monthly credits: ${monthlyCredits}`);
      
      // Update or create subscription record
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          plan_id: subscriptionPlanId,
          status: subscription.status,
          subscription_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
          amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
          monthly_credits: monthlyCredits,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      if (subscriptionError) {
        console.error("Error recording subscription:", subscriptionError);
      }
      
      // Add initial monthly credits to user account
      if (monthlyCredits > 0) {
        console.log(`Adding ${monthlyCredits} credits to user account`);
        
        // Get the user's current credits
        const { data: userCredits, error: fetchError } = await supabase
          .from("user_credits")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1);
        
        if (fetchError) {
          console.error("Error fetching user credits:", fetchError);
        } else {
          if (!userCredits || userCredits.length === 0) {
            // Create new credit record if none exists
            const { error: createError } = await supabase.rpc("create_user_credits", {
              user_id_param: userId,
              credits_balance_param: monthlyCredits
            });
            
            if (createError) {
              console.error("Error creating user credits:", createError);
            } else {
              console.log("Successfully created user credits with initial subscription credits");
            }
          } else {
            // Update existing credit record
            const latestCredit = userCredits[0];
            const newBalance = latestCredit.credits_balance + monthlyCredits;
            
            const { error: updateError } = await supabase
              .from("user_credits")
              .update({ 
                credits_balance: newBalance, 
                updated_at: new Date().toISOString() 
              })
              .eq("id", latestCredit.id);
            
            if (updateError) {
              console.error("Error updating user credits:", updateError);
            } else {
              console.log(`Successfully added ${monthlyCredits} credits. New balance: ${newBalance}`);
            }
          }
        }
        
        // Create a record of the subscription transaction
        const { error: transactionError } = await supabase
          .from("credit_transactions")
          .insert({
            user_id: userId,
            amount: monthlyCredits,
            type: "subscription",
            description: `${subscriptionPlanId} subscription - initial ${monthlyCredits} credits`
          });
        
        if (transactionError) {
          console.error("Error recording subscription transaction:", transactionError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          type: 'subscription',
          plan: subscriptionPlanId,
          credits: monthlyCredits,
          message: `Successfully subscribed to ${subscriptionPlanId} plan and received ${monthlyCredits} credits`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown session type" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error verifying checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
      }
    );
  }
});
