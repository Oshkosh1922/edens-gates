// Edge Function: Publish Winner (Secured Admin Operation)
// Deploy with: supabase functions deploy publish-winner

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Request/Response Types
interface PublishWinnerRequest {
  founderId: string
  weekNumber: number
}

interface PublishWinnerResponse {
  success: boolean
  error?: string
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { founderId, weekNumber }: PublishWinnerRequest = await req.json()

    if (!founderId || typeof weekNumber !== 'number') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'founderId and weekNumber (number) are required' 
        } as PublishWinnerResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key (admin access)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Begin transaction-like operations
    // 1. Insert winner record
    const { error: winnerError } = await supabaseAdmin
      .from('winners')
      .insert({ 
        founder_id: founderId, 
        week_number: weekNumber 
      })

    if (winnerError) {
      console.error('Insert winner error:', winnerError)
      return new Response(
        JSON.stringify({ success: false, error: winnerError.message } as PublishWinnerResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 2. Deactivate all active founders (end current round)
    const { error: deactivateError } = await supabaseAdmin
      .from('founders')
      .update({ is_active: false })
      .eq('is_active', true)

    if (deactivateError) {
      console.error('Deactivate founders error:', deactivateError)
      return new Response(
        JSON.stringify({ success: false, error: deactivateError.message } as PublishWinnerResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true } as PublishWinnerResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      } as PublishWinnerResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})