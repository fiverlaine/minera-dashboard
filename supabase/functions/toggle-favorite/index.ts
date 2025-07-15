import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Iniciando toggle-favorite v2.4.3 (Simplificado)')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('📊 Dados recebidos:', requestBody)

    const { library_id } = requestBody

    if (!library_id) {
      return new Response(
        JSON.stringify({ error: 'library_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔄 Executando toggle_ad_favorite_simple para library_id:', library_id)

    // Chamar função PostgreSQL simplificada
    const { data, error } = await supabaseClient
      .rpc('toggle_ad_favorite_simple', {
        p_library_id: library_id
      })

    if (error) {
      console.error('❌ Erro ao executar toggle_ad_favorite_simple:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao executar operação', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Operação realizada com sucesso:', data)

    // A função RPC retorna um array, pegar o primeiro resultado
    const result = data && data[0] ? data[0] : { success: false, is_favorite: false, message: 'Erro desconhecido' }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro geral na função toggle-favorite:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 