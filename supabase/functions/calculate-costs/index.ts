
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Credit conversion rate: $1 = 15 credits
const CREDIT_CONVERSION_RATE = 15;

// Service pricing (in USD)
const SERVICE_PRICING = {
  DUBBING: {
    BASE_PRICE_PER_MINUTE: 0.535,
    LIPSYNC_PRICE_PER_MINUTE: 1.035
  },
  SUBTITLES: {
    PRICE_PER_RUN: 0.052
  },
  VIDEO_GENERATION: {
    PRICE_PER_SECOND: 0.4
  }
};

// Add profit margin (100%)
const PROFIT_MULTIPLIER = 2;

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    const body = JSON.parse(requestBody);
    console.log("Parsed request body:", JSON.stringify(body));

    // Calculate costs
    let creditCost = 0;

    if (body.service === "dubbing") {
      const { durationMinutes, enableLipSync, languages } = body;
      
      // Calculate base cost for dubbing per minute
      const baseRatePerMinute = enableLipSync 
        ? SERVICE_PRICING.DUBBING.LIPSYNC_PRICE_PER_MINUTE 
        : SERVICE_PRICING.DUBBING.BASE_PRICE_PER_MINUTE;
      
      // Multiply by language count
      const languageCount = languages?.length || 1;
      
      // Calculate total cost
      const costUSD = baseRatePerMinute * durationMinutes * languageCount;
      
      // Apply profit margin and convert to credits
      creditCost = Math.ceil(costUSD * PROFIT_MULTIPLIER * CREDIT_CONVERSION_RATE);
    } 
    else if (body.service === "subtitles") {
      const { isPremiumModel } = body;
      
      // Premium model costs more than base price
      const baseRate = SERVICE_PRICING.SUBTITLES.PRICE_PER_RUN;
      const costUSD = isPremiumModel ? baseRate * 1.5 : baseRate;
      
      // Apply profit margin and convert to credits
      creditCost = Math.ceil(costUSD * PROFIT_MULTIPLIER * CREDIT_CONVERSION_RATE);
    } 
    else if (body.service === "video_generation") {
      const { durationSeconds } = body;
      
      // Calculate cost based on video duration
      const costUSD = SERVICE_PRICING.VIDEO_GENERATION.PRICE_PER_SECOND * durationSeconds;
      
      // Apply profit margin and convert to credits
      creditCost = Math.ceil(costUSD * PROFIT_MULTIPLIER * CREDIT_CONVERSION_RATE);
    } 
    else {
      throw new Error("Invalid service specified");
    }

    return new Response(JSON.stringify({ 
      creditCost,
      usdEquivalent: creditCost / CREDIT_CONVERSION_RATE 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error calculating costs:", error);
    
    return new Response(JSON.stringify({ 
      error: "Failed to calculate costs",
      details: error.message || "Unknown error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
