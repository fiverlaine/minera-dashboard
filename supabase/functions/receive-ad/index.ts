import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
    const { token, adData } = await req.json()

    console.log('📥 Dados recebidos:', { 
      token: token ? `${token.substring(0, 8)}...` : 'null',
      adData: {
        library_id: adData?.library_id,
        title: adData?.title?.substring(0, 50) + '...',
        advertiser_name: adData?.advertiser_name,
        page_photo_url: adData?.page_photo_url ? 'presente' : 'ausente',
        video_url: adData?.video_url ? 'presente' : 'ausente',
        thumbnail_url: adData?.thumbnail_url ? 'presente' : 'ausente'
      }
    })

    if (!token || !adData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token e dados do anúncio são obrigatórios' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate token and get user
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('user_id')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (tokenError || !tokenData) {
      console.error('❌ Token inválido:', tokenError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token inválido ou expirado' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Token válido para usuário:', tokenData.user_id)

    // NOVA IMPLEMENTAÇÃO: Usar função UPSERT que elimina problemas de duplicata
    const { data: result, error: upsertError } = await supabase.rpc('insert_or_update_ad', {
      p_user_id: tokenData.user_id,
      p_library_id: adData.library_id,
      p_title: adData.title,
      p_advertiser_name: adData.advertiser_name,
      p_description: adData.description,
      p_page_name: adData.page_name,
      p_page_photo_url: adData.page_photo_url,
      p_video_url: adData.video_url,
      p_thumbnail_url: adData.thumbnail_url,
      p_uses_count: adData.uses_count || 1,
      p_start_date: adData.start_date,
      p_end_date: adData.end_date,
      p_is_active: adData.is_active !== false,
      p_category: adData.category || 'Social Media',
      p_country: adData.country || 'BR',
      p_language: adData.language || 'pt',
      p_creative_format: adData.creative_format || 'image',
      p_platform: adData.platform || 'facebook',  // CORRIGIDO: minúsculo
      p_targeting_info: adData.targeting_info,
      p_performance_data: adData.performance_data,
      p_extracted_at: adData.extracted_at || new Date().toISOString(),
      p_page_url: adData.page_url,
      p_ad_url: adData.ad_url
    })

    if (upsertError) {
      console.error('❌ Erro ao processar anúncio:', upsertError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao processar anúncio: ' + upsertError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // O resultado sempre será um array com um item
    const adResult = result[0]
    
    if (adResult.was_updated) {
      console.log('🔄 Anúncio atualizado:', adResult.ad_id)
    } else {
      console.log('✅ Novo anúncio criado:', adResult.ad_id)
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: adResult.message,
        ad_id: adResult.ad_id,
        was_updated: adResult.was_updated
      }),
      { 
        status: adResult.was_updated ? 200 : 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro na função receive-ad:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 