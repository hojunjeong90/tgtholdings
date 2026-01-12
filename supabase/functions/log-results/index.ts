/**
 * Supabase Edge Function: log-results
 *
 * Logs price comparison results to Supabase for analytics and price history
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface LogRequest {
  session_id?: string;
  target_url: string;
  ota: string;
  countries_tested: string[];
  results: any[];
  lowest_country?: string;
  lowest_price_usd?: number;
  click_referral?: boolean;
  listing_metadata?: {
    title?: string;
    description?: string;
    destination?: string;
    property_type?: string;
    image_url?: string;
  };
}

// Generate MD5 hash for URL
async function generateUrlHash(url: string): Promise<string> {
  const normalizedUrl = url.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedUrl);
  const hashBuffer = await crypto.subtle.digest('MD5', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const logData: LogRequest = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate session ID if not provided
    const sessionId = logData.session_id || crypto.randomUUID();

    // 1. Insert into price_searches (existing table for backward compatibility)
    const logEntry = {
      session_id: sessionId,
      target_url: logData.target_url,
      ota: logData.ota,
      countries_tested: logData.countries_tested.length,
      country_list: logData.countries_tested,
      lowest_country: logData.lowest_country,
      lowest_price_usd: logData.lowest_price_usd,
      click_referral: logData.click_referral || false,
      results: logData.results,
      timestamp: new Date().toISOString(),
      user_agent: req.headers.get('user-agent'),
    };

    const { data: searchData, error: searchError } = await supabase
      .from('price_searches')
      .insert(logEntry)
      .select()
      .single();

    if (searchError) {
      console.error('Error inserting price_searches:', searchError);
      throw searchError;
    }

    // 2. Upsert listing (creates or updates)
    const urlHash = await generateUrlHash(logData.target_url);

    const listingData = {
      url_hash: urlHash,
      original_url: logData.target_url,
      ota: logData.ota,
      title: logData.listing_metadata?.title || null,
      description: logData.listing_metadata?.description || null,
      destination: logData.listing_metadata?.destination || null,
      property_type: logData.listing_metadata?.property_type || 'hotel',
      image_url: logData.listing_metadata?.image_url || null,
      last_checked: new Date().toISOString(),
      metadata: logData.listing_metadata || {},
    };

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .upsert(listingData, { onConflict: 'url_hash' })
      .select()
      .single();

    if (listingError) {
      console.error('Error upserting listing:', listingError);
      // Don't throw - continue with price snapshots even if listing fails
    }

    // Update check_count for existing listings
    if (listing) {
      await supabase.rpc('increment', {
        row_id: listing.id,
        table_name: 'listings',
        column_name: 'check_count'
      }).catch(() => {
        // Ignore increment errors - it's not critical
      });
    }

    // 3. Insert price snapshots for each country result
    const snapshots = logData.results.map((result: any) => ({
      listing_id: listing?.id || null,
      search_id: searchData.id,
      country: result.country,
      price_local: result.price_local || 0,
      currency: result.currency || 'USD',
      price_usd: result.price_usd || null,
      normalized_usd: result.normalized_usd || null,
      tax_rate: result.tax_rate || null,
      exchange_rate: result.exchange_rate || null,
      snapshot_date: new Date().toISOString(),
      success: result.success !== false,
      error_message: result.error || null,
      metadata: result.metadata || {},
    }));

    if (snapshots.length > 0) {
      const { error: snapshotsError } = await supabase
        .from('price_snapshots')
        .insert(snapshots);

      if (snapshotsError) {
        console.error('Error inserting price_snapshots:', snapshotsError);
        // Don't throw - search was already logged
      }
    }

    console.log(`Logged search: ${sessionId} - ${logData.countries_tested.length} countries, listing: ${listing?.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        session_id: sessionId,
        search_id: searchData.id,
        listing_id: listing?.id,
        logged_at: searchData.timestamp,
        snapshots_count: snapshots.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in log-results:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
