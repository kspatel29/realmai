
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
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { userId } = await req.json();
    
    if (!userId) {
      console.error("Missing user ID in request");
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Checking payment methods for user: ${userId}`);

    // Transform userId into a valid Stripe customer ID
    const customerId = `cus_${userId.replace(/-/g, '')}`;
    let hasPaymentMethod = false;
    
    try {
      // Check if customer exists first
      const customer = await stripe.customers.retrieve(customerId);
      console.log(`Found customer: ${customerId}, deleted status: ${customer.deleted}`);
      
      if (customer && !customer.deleted) {
        // Check for payment methods
        console.log(`Listing payment methods for customer: ${customerId}`);
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });
        
        hasPaymentMethod = paymentMethods.data.length > 0;
        console.log(`Customer has ${paymentMethods.data.length} payment methods`);
      }
    } catch (error) {
      // Customer likely doesn't exist, which is fine
      console.log(`Customer doesn't exist or error retrieving: ${error.message}`);
      hasPaymentMethod = false;
    }

    console.log(`Returning hasPaymentMethod: ${hasPaymentMethod} for user: ${userId}`);
    
    return new Response(
      JSON.stringify({
        hasPaymentMethod,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error in check-payment-method: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        hasPaymentMethod: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Still return 200 for frontend to handle gracefully
      }
    );
  }
});
