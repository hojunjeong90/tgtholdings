/**
 * Supabase Edge Function: fetch-prices
 *
 * Calls the crawler-service to fetch prices from multiple countries
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface FetchPricesRequest {
  url: string;
  countries: string[];
  ota?: string;
}

interface PriceResult {
  country: string;
  price_local: number;
  currency: string;
  price_usd?: number;
  timestamp: string;
  ota: string;
  success: boolean;
  error?: string;
  metadata?: any;
}

/**
 * Generate mock price data for testing without crawler
 */
function generateMockPrice(country: string, ota: string): PriceResult {
  // Base prices per country (realistic hotel prices)
  const mockPrices: { [key: string]: { local: number; currency: string } } = {
    KR: { local: 120000, currency: 'KRW' },
    JP: { local: 15800, currency: 'JPY' },
    SG: { local: 280, currency: 'SGD' },
    US: { local: 150, currency: 'USD' },
    TH: { local: 3500, currency: 'THB' },
    VN: { local: 2800000, currency: 'VND' },
    ID: { local: 1500000, currency: 'IDR' },
    MY: { local: 420, currency: 'MYR' },
  };

  const priceData = mockPrices[country] || { local: 100, currency: 'USD' };

  // Add random variation (±10%)
  const variation = 0.9 + Math.random() * 0.2;
  const price = Math.round(priceData.local * variation);

  return {
    country,
    price_local: price,
    currency: priceData.currency,
    timestamp: new Date().toISOString(),
    ota,
    success: true,
    metadata: {
      selector_used: 'MOCK_DATA',
      retry_count: 0,
      load_time_ms: 100,
    },
  };
}

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, countries, ota = 'agoda' }: FetchPricesRequest = await req.json();

    // Validate input
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!countries || countries.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one country is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if running in mock mode (for development without proxy)
    const useMockData = Deno.env.get('USE_MOCK_DATA') === 'true';

    console.log(`Fetching prices for ${countries.length} countries from ${url} (Mock: ${useMockData})`);

    let results: PriceResult[];

    if (useMockData) {
      // Generate mock data for development/testing
      results = countries.map((country) => generateMockPrice(country, ota));
    } else {
      // Get crawler service URL from environment
      const crawlerServiceUrl = Deno.env.get('CRAWLER_SERVICE_URL') || 'http://localhost:3001';

      // Call crawler service for each country (in parallel)
      results = await Promise.all(
        countries.map(async (country) => {
          try {
            const response = await fetch(`${crawlerServiceUrl}/crawl`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, country, ota }),
            });

            if (!response.ok) {
              throw new Error(`Crawler service returned ${response.status}`);
            }

            const result: PriceResult = await response.json();
            return result;
          } catch (error: any) {
            console.error(`Failed to fetch price for ${country}:`, error.message);
            return {
              country,
              price_local: 0,
              currency: 'USD',
              timestamp: new Date().toISOString(),
              ota,
              success: false,
              error: error.message,
            };
          }
        })
      );
    }

    // Return results
    return new Response(
      JSON.stringify({
        url,
        ota,
        results,
        total_countries: countries.length,
        successful: results.filter(r => r.success).length,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in fetch-prices:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
