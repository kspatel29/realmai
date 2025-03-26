
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";

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
    const STRIPE_SECRET_KEY = "sk_test_51QRqRsRuznwovkUG5E4UBy83IwsC5bjhwawLuGg28qf16r1FxzsPapwhVRBuJu8W4uLdBkh2pbiLC9nvfPwpNmMr00Uea9zXCq";
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { purchase } = await req.json();
    
    if (!purchase || !purchase.packageId || !purchase.amount || !purchase.credits || !purchase.userId) {
      return new Response(
        JSON.stringify({ error: "Missing required purchase information" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Transform userId to Stripe customer ID format
    const customerId = `cus_${purchase.userId.replace(/-/g, '')}`;
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: purchase.amount * 100, // Amount in cents
      currency: "usd",
      metadata: {
        packageId: purchase.packageId,
        userId: purchase.userId,
        credits: purchase.credits.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
