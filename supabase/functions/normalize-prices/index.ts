/**
 * Supabase Edge Function: normalize-prices
 *
 * Normalizes prices using exchange rates and country-specific tax rates
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface PriceResult {
  country: string;
  price_local: number;
  currency: string;
  price_usd?: number;
  timestamp: string;
  ota: string;
  success: boolean;
}

interface NormalizedResult extends PriceResult {
  normalized_usd: number;
  tax_rate: number;
  exchange_rate: number;
  diff_from_base_percent?: number;
}

interface NormalizeRequest {
  results: PriceResult[];
  base_country?: string;
}

// Country-specific tax rates (VAT, GST, etc.)
const TAX_RATES: { [country: string]: number } = {
  KR: 0.10,  // 10% VAT
  JP: 0.10,  // 10% consumption tax
  SG: 0.08,  // 8% GST (9% from 2024)
  US: 0.00,  // No federal VAT (varies by state)
  TH: 0.07,  // 7% VAT
  VN: 0.10,  // 10% VAT
  ID: 0.11,  // 11% VAT
  MY: 0.00,  // No GST currently
};

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { results, base_country = 'US' }: NormalizeRequest = await req.json();

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Results array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch current exchange rates
    const exchangeRates = await getExchangeRates();

    // Normalize each result
    const normalizedResults: NormalizedResult[] = results.map(result => {
      if (!result.success) {
        return {
          ...result,
          normalized_usd: 0,
          tax_rate: 0,
          exchange_rate: 0,
        };
      }

      const taxRate = TAX_RATES[result.country] || 0;
      const exchangeRate = exchangeRates[result.currency] || 1;

      // Calculate normalized USD price
      // Formula: (local_price / exchange_rate) * (1 + tax_rate)
      const normalizedUsd = (result.price_local / exchangeRate) * (1 + taxRate);

      return {
        ...result,
        normalized_usd: parseFloat(normalizedUsd.toFixed(2)),
        tax_rate: taxRate,
        exchange_rate: exchangeRate,
      };
    });

    // Calculate percentage difference from base country
    const baseResult = normalizedResults.find(r => r.country === base_country && r.success);
    if (baseResult) {
      normalizedResults.forEach(result => {
        if (result.success && result.normalized_usd > 0) {
          const diff = ((result.normalized_usd - baseResult.normalized_usd) / baseResult.normalized_usd) * 100;
          result.diff_from_base_percent = parseFloat(diff.toFixed(2));
        }
      });
    }

    // Find lowest price
    const successfulResults = normalizedResults.filter(r => r.success && r.normalized_usd > 0);
    const lowestPrice = successfulResults.length > 0
      ? Math.min(...successfulResults.map(r => r.normalized_usd))
      : 0;
    const lowestCountry = successfulResults.find(r => r.normalized_usd === lowestPrice)?.country;

    return new Response(
      JSON.stringify({
        normalized_results: normalizedResults,
        base_country,
        lowest_price_usd: lowestPrice,
        lowest_country: lowestCountry,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in normalize-prices:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Fetch current exchange rates from API
 */
async function getExchangeRates(): Promise<{ [currency: string]: number }> {
  try {
    const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');

    // Try exchangerate-api.com (free tier)
    const response = await fetch(
      apiKey
        ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
        : 'https://open.er-api.com/v6/latest/USD'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    return data.conversion_rates || data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates, using fallback:', error);

    // Fallback rates (approximate, update periodically)
    return {
      USD: 1,
      KRW: 1320,
      JPY: 148,
      SGD: 1.34,
      THB: 35,
      VND: 24500,
      IDR: 15700,
      MYR: 4.7,
    };
  }
}
