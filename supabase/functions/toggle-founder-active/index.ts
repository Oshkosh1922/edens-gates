// Edge Function: Toggle Founder Active Status (Secured Admin Operation)
// Deploy with: supabase functions deploy toggle-founder-active

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Request/Response Types
interface ToggleFounderActiveRequest {
  founderId: string
  isActive: boolean
}

interface ToggleFounderActiveResponse {
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
    const { founderId, isActive }: ToggleFounderActiveRequest = await req.json()

    if (!founderId || typeof isActive !== 'boolean') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'founderId and isActive (boolean) are required' 
        } as ToggleFounderActiveResponse),
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

    // Update founder active status - only service role can modify admin fields
    const { error } = await supabaseAdmin
      .from('founders')
      .update({ is_active: isActive })
      .eq('id', founderId)

    if (error) {
      console.error('Toggle founder active error:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message } as ToggleFounderActiveResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true } as ToggleFounderActiveResponse),
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
      } as ToggleFounderActiveResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})