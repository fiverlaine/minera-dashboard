import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body = await req.json()
    const { token } = body
    
    console.log('Received token length:', token?.length || 0)

    if (!token) {
      console.log('Token missing from request')
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Token é obrigatório' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate token format - mais flexível
    const tokenString = String(token).trim()
    console.log('Token to validate:', tokenString)
    
    if (tokenString.length < 30) {
      console.log('Token too short')
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Formato de token inválido - muito curto' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if token exists and is active
    console.log('Querying database for token...')
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select(`
        id,
        user_id,
        is_active
      `)
      .eq('token', tokenString)
      .eq('is_active', true)
      .single()

    console.log('Token query result:', { tokenData, tokenError })

    if (tokenError || !tokenData) {
      console.log('Token not found or inactive:', tokenError?.message)
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Token inválido ou expirado' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user profile data
    console.log('Getting user profile for user_id:', tokenData.user_id)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', tokenData.user_id)
      .single()

    console.log('Profile query result:', { profileData, profileError })

    if (profileError || !profileData) {
      console.log('Profile not found:', profileError?.message)
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Usuário não encontrado' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success with user data
    console.log('Token validation successful for user:', profileData.email)
    return new Response(
      JSON.stringify({
        valid: true,
        user: {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Validate token error:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 