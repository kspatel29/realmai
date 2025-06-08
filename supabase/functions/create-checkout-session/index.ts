
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pre-configured Stripe price IDs for each subscription plan
const SUBSCRIPTION_PRICE_IDS = {
  "essentials": "price_1RTBqlRuznwovkUGacCIEldb", // For product prod_SNxmEhAG1n0n6e
  "creator-pro": "price_1RTBsBRuznwovkUGRCA7YY3m", // For product prod_SNxnqjwYw3j065
  "studio-pro": "price_REPLACE_WITH_STUDIO_PRO_PRICE_ID", // Create this product and price in Stripe
};

// Pre-configured Stripe price IDs for credit packages
const CREDIT_PACKAGE_PRICE_IDS = {
  "small": "price_1RTCmaRuznwovkUGYdHsLwmk", // Small Pack: prod_SNykS8eG43JidY
  "medium": "price_1RTCn3RuznwovkUGG9S8BUha", // Medium Pack: prod_SNykr0YszT0cAL
  "large": "price_1RTCngRuznwovkUGmOR5BU90", // Large Pack: prod_SNyl6DVUg2cysA
  "xl": "price_1RTCoARuznwovkUGeMS75yDi", // XL Pack: prod_SNylh8po1jVw80
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
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY environment variable" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    console.log("Creating Stripe instance with secret key");
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { mode, price, userId, packageId, credits, subscriptionPlanId } = await req.json();
    
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

    console.log(`Creating checkout session for user ${userId}, mode: ${mode}`);
    
    // Common parameters for both one-time and subscription payments
    const baseParams = {
      payment_method_types: ['card'],
      mode: mode,
      success_url: `${req.headers.get("origin")}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${req.headers.get("origin")}/dashboard/billing?canceled=true`,
      client_reference_id: userId,
    };

    let sessionParams;

    if (mode === 'payment') {
      // One-time payment for credit packages using pre-configured price IDs
      if (!packageId) {
        console.error("Missing package ID", { packageId });
        return new Response(
          JSON.stringify({ error: "Missing package ID for credit purchase" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Get the pre-configured price ID for this credit package
      const priceId = CREDIT_PACKAGE_PRICE_IDS[packageId as keyof typeof CREDIT_PACKAGE_PRICE_IDS];
      
      console.log(`Found price ID for package ${packageId}: ${priceId}`);
      
      if (!priceId) {
        console.error(`No price ID configured for package: ${packageId}`);
        return new Response(
          JSON.stringify({ 
            error: `No price ID configured for credit package ${packageId}`,
            details: `Available packages: ${Object.keys(CREDIT_PACKAGE_PRICE_IDS).join(', ')}`
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
      
      console.log(`Creating payment session for package ${packageId}, credits: ${credits}, using price ID: ${priceId}`);
      sessionParams = {
        ...baseParams,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
          packageId: packageId,
          credits: credits?.toString() || "0",
          type: 'credit_purchase'
        },
      };
    } else if (mode === 'subscription') {
      // Subscription payment using pre-configured price IDs
      if (!subscriptionPlanId) {
        console.error("Missing subscription plan ID", { subscriptionPlanId });
        return new Response(
          JSON.stringify({ error: "Missing subscription plan ID" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
      
      console.log(`Creating subscription session for plan ${subscriptionPlanId}`);
      console.log(`Available price IDs:`, SUBSCRIPTION_PRICE_IDS);
      
      // Get the pre-configured price ID for this subscription plan
      const priceId = SUBSCRIPTION_PRICE_IDS[subscriptionPlanId as keyof typeof SUBSCRIPTION_PRICE_IDS];
      
      console.log(`Found price ID for plan ${subscriptionPlanId}: ${priceId}`);
      
      if (!priceId || priceId.includes("REPLACE_WITH")) {
        console.error(`No price ID configured for plan: ${subscriptionPlanId}`);
        return new Response(
          JSON.stringify({ 
            error: `Please configure the price ID for subscription plan ${subscriptionPlanId} in the Stripe dashboard`,
            details: `You need to create a price for this plan and update SUBSCRIPTION_PRICE_IDS in the edge function`
          }),
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
            price: priceId,
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
      console.error("Invalid mode", { mode });
      return new Response(
        JSON.stringify({ error: "Invalid mode. Must be 'payment' or 'subscription'" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Creating checkout session with params", JSON.stringify(sessionParams, null, 2));
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("Checkout session created successfully", { id: session.id, url: session.url });

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
