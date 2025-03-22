
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
    
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { paymentIntentId } = await req.json();
    
    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({ error: "Missing payment intent ID" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Retrieve the payment intent to verify its status and metadata
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== "succeeded") {
      return new Response(
        JSON.stringify({ error: "Payment has not been completed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const userId = paymentIntent.metadata.userId;
    const creditAmount = parseInt(paymentIntent.metadata.credits, 10);
    
    if (!userId || !creditAmount) {
      return new Response(
        JSON.stringify({ error: "Invalid metadata in payment intent" }),
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
      
      return new Response(
        JSON.stringify({ success: true, credits: newCredits }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // Update existing credit record
      const latestCredit = userCredits[0];
      const newBalance = latestCredit.credits_balance + creditAmount;
      
      const { data: updatedCredits, error: updateError } = await supabase
        .from("user_credits")
        .update({ 
          credits_balance: newBalance, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", latestCredit.id)
        .select()
        .single();
      
      if (updateError) {
        throw new Error(`Error updating user credits: ${updateError.message}`);
      }
      
      // Create a record of the transaction
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount: creditAmount,
          type: "purchase",
          payment_intent_id: paymentIntentId,
          package_id: paymentIntent.metadata.packageId,
          description: `Purchased ${creditAmount} credits`
        });
      
      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        // Continue even if transaction recording fails
      }
      
      return new Response(
        JSON.stringify({ success: true, credits: updatedCredits }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error confirming credit purchase:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
