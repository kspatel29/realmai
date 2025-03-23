
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

    // Use the customer ID format
    const customerId = `cus_${userId.replace(/-/g, '')}`;
    let hasPaymentMethod = false;
    
    try {
      // Check if customer exists first
      const customer = await stripe.customers.retrieve(customerId);
      
      if (customer && !customer.deleted) {
        // Check for payment methods
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });
        
        hasPaymentMethod = paymentMethods.data.length > 0;
      }
    } catch (error) {
      // Customer likely doesn't exist
      console.log("Customer not found or other error:", error.message);
      hasPaymentMethod = false;
    }

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
    console.error("Error checking payment method:", error);
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
