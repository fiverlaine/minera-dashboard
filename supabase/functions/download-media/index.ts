import "jsr:@supabase/functions-js/edge-runtime.d.ts"

interface MediaRequest {
  url: string
  filename?: string
}

Deno.serve(async (req: Request) => {
  // Permitir CORS para o frontend
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { url, filename }: MediaRequest = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL da mídia é obrigatória' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Fazendo proxy de download para:', url)

    // Fazer fetch da mídia original
    const mediaResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      }
    })

    if (!mediaResponse.ok) {
      console.error('Erro ao buscar mídia:', mediaResponse.status, mediaResponse.statusText)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao buscar mídia: ' + mediaResponse.status + ' ' + mediaResponse.statusText
        }),
        { 
          status: mediaResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Obter o tipo de conteúdo da resposta original
    const contentType = mediaResponse.headers.get('content-type') || 'application/octet-stream'
    
    // Obter o corpo da resposta como stream
    const mediaBlob = await mediaResponse.blob()

    // Definir headers para download
    const downloadHeaders = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Disposition': 'attachment; filename="' + (filename || 'minera_media') + '"',
      'Content-Length': mediaBlob.size.toString(),
      'Cache-Control': 'no-cache',
    }

    console.log('Proxy de download bem-sucedido para:', filename || 'arquivo')

    // Retornar a mídia com headers apropriados para download
    return new Response(mediaBlob, {
      status: 200,
      headers: downloadHeaders
    })

  } catch (error) {
    console.error('Erro no proxy de download:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor no proxy de download',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 