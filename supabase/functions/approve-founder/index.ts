// Edge Function: Approve Founder (Secured Admin Operation)
// Deploy with: supabase functions deploy approve-founder

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Request/Response Types
interface ApproveFounderRequest {
  founderId: string
}

interface ApproveFounderResponse {
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
    const { founderId }: ApproveFounderRequest = await req.json()

    if (!founderId) {
      return new Response(
        JSON.stringify({ success: false, error: 'founderId is required' } as ApproveFounderResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key (admin access)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role key for admin operations
    )

    // Update founder status - only service role can modify admin fields
    const { error } = await supabaseAdmin
      .from('founders')
      .update({ 
        status: 'approved', 
        is_active: false // Approved but not yet active for voting
      })
      .eq('id', founderId)

    if (error) {
      console.error('Approve founder error:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message } as ApproveFounderResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true } as ApproveFounderResponse),
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
      } as ApproveFounderResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})