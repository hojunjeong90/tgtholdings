import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Currency list (KRW excluded) - 53 currencies total
const CURRENCIES = [
  'XPF', 'LKR', 'CZK', 'NGN', 'SEK', 'KZT', 'ZAR', 'CHF', 'QAR', 'NOK',
  'SGD', 'KHR', 'NZD', 'AED', 'CAD', 'TWD', 'AFN', 'COP', 'DKK', 'GBP',
  'KWD', 'LAK', 'OMR', 'THB', 'RUB', 'JOD', 'TRY', 'RON', 'UAH', 'PKR',
  'MYR', 'EUR', 'PLN', 'MXN', 'ILS', 'FJD', 'MVR', 'EGP', 'PHP', 'USD',
  'IDR', 'BHD', 'INR', 'HUF', 'BDT', 'JPY', 'AUD', 'VND', 'CNY', 'HKD',
  'BRL', 'SAR', 'CLP'
];

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Exchange Rate Cron Started ===');

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current rotation index from cron_state
    const { data: stateData, error: stateError } = await supabase
      .from('cron_state')
      .select('current_index, total_currencies')
      .eq('id', 'exchange_rate_cron')
      .single();

    if (stateError) {
      throw new Error(`Failed to get cron state: ${stateError.message}`);
    }

    const currentIndex = stateData.current_index;
    const totalCurrencies = CURRENCIES.length;

    // Get current currency to fetch
    const currentCurrency = CURRENCIES[currentIndex];
    console.log(`Fetching exchange rate ${currentIndex + 1}/${totalCurrencies}: ${currentCurrency} → KRW`);

    // Fetch exchange rate from Naver
    const naverUrl = `https://m.search.naver.com/p/csearch/content/qapirender.nhn?key=calculator&pkid=141&q=%ED%99%98%EC%9C%A8&where=m&u1=keb&u6=standardUnit&u7=0&u3=${currentCurrency}&u4=KRW&u8=down&u2=1`;

    console.log(`Fetching from Naver: ${naverUrl}`);

    const response = await fetch(naverUrl);
    console.log(`Naver API status: ${response.status}`);

    let rateSaved = false;

    if (!response.ok) {
      console.warn(`⚠️  Naver API returned ${response.status} for ${currentCurrency}, skipping...`);
    } else {
      const responseText = await response.text();
      console.log(`Naver response length: ${responseText.length}`);

      if (!responseText || responseText.trim().length === 0) {
        console.warn(`⚠️  Empty response for ${currentCurrency}, skipping...`);
      } else {
        let data;
        try {
          data = JSON.parse(responseText);
          console.log(`Parsed data for ${currentCurrency}`);

          // Validate response
          if (!data.country || data.country.length < 2) {
            console.warn(`⚠️  No exchange rate data for ${currentCurrency}, skipping...`);
          } else {
            // Extract rate (second item is KRW value)
            const rateValue = data.country[1].value;
            const rate = parseFloat(rateValue.replace(/,/g, ''));

            console.log(`Rate value: ${rateValue}, parsed: ${rate}`);

            if (isNaN(rate)) {
              console.warn(`⚠️  Invalid rate for ${currentCurrency}: ${rateValue}`);
            } else {
              // Insert into database
              const { error: insertError } = await supabase
                .from('exchange_rates')
                .insert({
                  from_currency: currentCurrency,
                  to_currency: 'KRW',
                  rate: rate,
                });

              if (insertError) {
                console.error(`❌ Failed to insert ${currentCurrency}: ${insertError.message}`);
              } else {
                console.log(`✅ ${currentCurrency} → KRW: ${rate} inserted successfully`);
                rateSaved = true;
              }
            }
          }
        } catch (parseError) {
          console.error(`❌ Failed to parse JSON for ${currentCurrency}:`, parseError);
        }
      }
    }

    // Update rotation index
    const nextIndex = (currentIndex + 1) % totalCurrencies;
    const { error: updateError } = await supabase
      .from('cron_state')
      .update({
        current_index: nextIndex,
        last_updated: new Date().toISOString(),
      })
      .eq('id', 'exchange_rate_cron');

    if (updateError) {
      console.error(`Failed to update cron state: ${updateError.message}`);
    }

    console.log('=== Exchange Rate Cron Completed ===');

    return new Response(
      JSON.stringify({
        success: true,
        currency: currentCurrency,
        rateSaved: rateSaved,
        nextCurrency: CURRENCIES[nextIndex],
        nextIndex: nextIndex,
        totalCurrencies: totalCurrencies,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('=== Exchange Rate Cron Error ===');
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
