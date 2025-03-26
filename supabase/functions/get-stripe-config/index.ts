
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const STRIPE_PUBLIC_KEY = Deno.env.get("STRIPE_PUBLIC_KEY");
    
    if (!STRIPE_PUBLIC_KEY) {
      console.error("Missing STRIPE_PUBLIC_KEY environment variable");
      return new Response(
        JSON.stringify({ 
          error: "Missing Stripe configuration" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    // Return the publishable key to the client
    return new Response(
      JSON.stringify({
        publishableKey: STRIPE_PUBLIC_KEY
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error retrieving Stripe configuration:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
