import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Country to Currency mapping
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', MX: 'MXN',
  GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', GR: 'EUR', FI: 'EUR', SI: 'EUR',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK',
  HU: 'HUF', RO: 'RON', BG: 'BGN', HR: 'HRK', RU: 'RUB', UA: 'UAH', TR: 'TRY',
  JP: 'JPY', KR: 'KRW', CN: 'CNY', HK: 'HKD', TW: 'TWD', SG: 'SGD',
  MY: 'MYR', TH: 'THB', VN: 'VND', ID: 'IDR', PH: 'PHP', IN: 'INR',
  PK: 'PKR', BD: 'BDT', LK: 'LKR', KH: 'KHR', LA: 'LAK', AU: 'AUD',
  NZ: 'NZD', FJ: 'FJD', MV: 'MVR', KZ: 'KZT',
  SA: 'SAR', AE: 'AED', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR',
  JO: 'JOD', IL: 'ILS', EG: 'EGP',
  BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
  ZA: 'ZAR', NG: 'NGN', KE: 'KES',
  NC: 'XPF', PF: 'XPF', WF: 'XPF', AF: 'AFN',
};

// Currency to Symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', KRW: '₩',
  CAD: '$', AUD: '$', NZD: '$', HKD: '$', SGD: '$',
  MXN: '$', BRL: 'R$', ARS: '$', CLP: '$',
  CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr',
  PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei',
  TRY: '₺', ZAR: 'R', ILS: '₪', THB: '฿',
  PHP: '₱', VND: '₫', IDR: 'Rp', MYR: 'RM',
  INR: '₹', BDT: '৳', PKR: '₨', LKR: 'රු',
  SAR: 'SR', AED: 'AED', QAR: 'QR', KWD: 'KD',
  BHD: 'BD', OMR: 'OMR', JOD: 'JD', EGP: 'E£',
  KZT: '₸', UAH: '₴', NGN: '₦', LAK: '₭',
  KHR: '៛', MVR: 'Rf', FJD: '$', XPF: 'F', AFN: '؋',
};

function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode] || 'USD';
}

function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || '';
}

interface WebshareProxy {
  id: string;
  username: string;
  password: string;
  proxy_address: string;
  port: number;
  valid: boolean;
  last_verification: string;
  country_code: string;
  city_name: string;
  created_at: string;
}

interface WebshareAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WebshareProxy[];
}

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Webshare Proxy Sync Started ===');

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webshareAPIKey = Deno.env.get('WEBSHARE_API_KEY');

    if (!webshareAPIKey) {
      throw new Error('WEBSHARE_API_KEY not configured');
    }

    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch proxies from Webshare API
    console.log('Fetching proxies from Webshare API...');
    const url = new URL('https://proxy.webshare.io/api/v2/proxy/list/');
    url.searchParams.append('mode', 'direct');
    url.searchParams.append('page', '1');
    url.searchParams.append('page_size', '100');

    const response = await fetch(url.href, {
      method: 'GET',
      headers: {
        Authorization: `Token ${webshareAPIKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Webshare API returned ${response.status}`);
    }

    const data: WebshareAPIResponse = await response.json();

    console.log(`Fetched ${data.results.length} proxies from Webshare`);

    // Upsert proxies to Supabase with currency_code and currency_symbol
    const proxyRecords = data.results.map((proxy) => {
      const currencyCode = getCurrencyForCountry(proxy.country_code);
      return {
        id: proxy.id,
        proxy_address: proxy.proxy_address,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        country_code: proxy.country_code,
        city_name: proxy.city_name,
        currency_code: currencyCode,
        currency_symbol: getCurrencySymbol(currencyCode),
        valid: proxy.valid,
        last_verification: proxy.last_verification,
        last_synced: new Date().toISOString(),
      };
    });

    const { error: upsertError } = await supabase
      .from('webshare_proxies')
      .upsert(proxyRecords, {
        onConflict: 'id',
      });

    if (upsertError) {
      console.error('Failed to upsert proxies:', upsertError);
      throw new Error(`Database error: ${upsertError.message}`);
    }

    // Count valid proxies
    const validCount = data.results.filter((p) => p.valid).length;
    const countries = [...new Set(data.results.map((p) => p.country_code))];

    console.log(`Successfully synced ${data.results.length} proxies`);
    console.log(`Valid: ${validCount}, Invalid: ${data.results.length - validCount}`);
    console.log(`Countries: ${countries.length}`);

    console.log('=== Webshare Proxy Sync Completed ===');

    return new Response(
      JSON.stringify({
        success: true,
        total: data.results.length,
        valid: validCount,
        invalid: data.results.length - validCount,
        countries: countries.length,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('=== Webshare Proxy Sync Error ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
