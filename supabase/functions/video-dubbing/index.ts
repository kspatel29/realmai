
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // Get the API token from environment variables
    const SIEVE_API_KEY = Deno.env.get('SIEVE_API_KEY');
    if (!SIEVE_API_KEY) {
      console.error("SIEVE_API_KEY is not set");
      throw new Error("API configuration error: SIEVE_API_KEY is not set");
    }

    // Parse the request body
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    let body;
    try {
      body = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(JSON.stringify({ error: `Invalid JSON in request: ${parseError.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Parsed request body:", JSON.stringify(body));

    // Handle different types of requests
    if (body.action === "check_status") {
      // Status check for existing job
      console.log("Checking status for job:", body.jobId);
      
      const statusUrl = `${body.apiBaseUrl}/jobs/${body.jobId}`;
      console.log(`Status check URL: ${statusUrl}`);
      
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': SIEVE_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        console.error(`Error response from API for job ${body.jobId}:`, errorData);
        return new Response(JSON.stringify({ 
          error: errorData.message || `Failed with HTTP status ${statusResponse.status}` 
        }), {
          status: statusResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const data = await statusResponse.json();
      console.log(`Raw API response for job ${body.jobId}:`, JSON.stringify(data, null, 2));
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (body.action === "submit_job") {
      // New job submission
      console.log("Submitting new dubbing job with payload:", JSON.stringify(body.payload, null, 2));
      
      const response = await fetch(`${body.apiBaseUrl}/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': SIEVE_API_KEY
        },
        body: JSON.stringify(body.payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from API:", errorData);
        return new Response(JSON.stringify({ 
          error: errorData.message || `Failed with HTTP status ${response.status}` 
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      console.log("Job submitted successfully:", data);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid action specified" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Error details:", JSON.stringify({
      message: error.message || "Unknown error",
      stack: error.stack,
      name: error.name
    }));
    
    return new Response(JSON.stringify({ 
      error: "Video dubbing operation failed",
      details: error.message || "Unknown error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
