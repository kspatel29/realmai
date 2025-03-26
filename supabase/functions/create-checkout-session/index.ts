
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
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { mode, price, userId, packageId, credits, subscriptionPlanId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Common parameters for both one-time and subscription payments
    const baseParams = {
      payment_method_types: ['card'],
      mode: mode,
      success_url: `${req.headers.get("origin")}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${req.headers.get("origin")}/dashboard/billing?canceled=true`,
      customer_email: null, // Let Stripe collect the email
      client_reference_id: userId,
    };

    let sessionParams;

    if (mode === 'payment') {
      // One-time payment for credit packages
      if (!packageId || !credits || !price) {
        return new Response(
          JSON.stringify({ error: "Missing package information for one-time payment" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
      
      sessionParams = {
        ...baseParams,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${credits} Credits Package`,
                description: `Purchase of ${credits} credits`,
              },
              unit_amount: price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
          packageId: packageId,
          credits: credits.toString(),
          type: 'credit_purchase'
        },
      };
    } else if (mode === 'subscription') {
      // Subscription payment
      if (!subscriptionPlanId || !price) {
        return new Response(
          JSON.stringify({ error: "Missing subscription information" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
      
      // Create or retrieve the product for this subscription plan
      const product = await stripe.products.create({
        name: `${subscriptionPlanId.charAt(0).toUpperCase() + subscriptionPlanId.slice(1)} Plan`,
        description: `Subscription to the ${subscriptionPlanId} plan`,
      });
      
      // Create price object for the subscription
      const priceObj = await stripe.prices.create({
        unit_amount: price * 100, // Convert to cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id,
      });
      
      sessionParams = {
        ...baseParams,
        line_items: [
          {
            price: priceObj.id,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
          subscriptionPlanId: subscriptionPlanId,
          type: 'subscription'
        },
      };
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Must be 'payment' or 'subscription'" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
