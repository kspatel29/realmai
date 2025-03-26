
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
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

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
    
    // Ensure the customer exists in Stripe
    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
      
      if (customer.deleted) {
        // Create a new customer if previously deleted
        customer = await stripe.customers.create({
          id: customerId,
          metadata: { userId: purchase.userId }
        });
      }
    } catch (error) {
      // Customer doesn't exist, create a new one
      customer = await stripe.customers.create({
        id: customerId,
        metadata: { userId: purchase.userId }
      });
    }

    // Check if customer has a default payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    // Create a payment intent
    const paymentIntentParams: any = {
      amount: purchase.amount * 100, // Amount in cents
      currency: "usd",
      metadata: {
        packageId: purchase.packageId,
        userId: purchase.userId,
        credits: purchase.credits.toString(),
      },
      customer: customerId,
    };
    
    // If customer has a payment method, use it
    if (paymentMethods.data.length > 0) {
      paymentIntentParams.payment_method = paymentMethods.data[0].id;
      paymentIntentParams.off_session = true;
      paymentIntentParams.confirm = true;
    }
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        requiresAction: paymentIntent.status === 'requires_action',
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
