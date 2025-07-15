-- MIGRAÇÃO v3.8.5: Correção de falsos positivos WhatsApp
-- Data: Dezembro 2024
-- Objetivo: Corrigir anúncios incorretamente classificados como WhatsApp

-- Identificar e corrigir anúncios que foram classificados como WhatsApp mas não são
-- Critério: Se tem link_type = 'whatsapp' mas URL não contém indicadores WhatsApp inequívocos

UPDATE ads 
SET 
    link_type = 'unknown',
    updated_at = NOW()
WHERE 
    link_type = 'whatsapp' 
    AND ad_url IS NOT NULL
    AND ad_url NOT ILIKE '%api.whatsapp.com%'
    AND ad_url NOT ILIKE '%wa.me%'
    AND ad_url NOT ILIKE '%whatsapp.com%'
    AND (
        -- Anúncios de e-commerce (domínios conhecidos)
        ad_url ILIKE '%primacial.com%'
        OR ad_url ILIKE '%shopee.com%'
        OR ad_url ILIKE '%mercadolivre.com%'
        OR ad_url ILIKE '%americanas.com%'
        OR ad_url ILIKE '%amazon.com%'
        OR ad_url ILIKE '%magalu.com%'
        OR ad_url ILIKE '%casasbahia.com%'
        OR ad_url ILIKE '%extra.com%'
        
        -- Ou anúncios que claramente não são WhatsApp baseado no texto
        OR (
            ad_text NOT ILIKE '%whatsapp%' 
            AND ad_text NOT ILIKE '%whats app%'
            AND ad_text NOT ILIKE '%what''s app%'
            AND ad_text NOT ILIKE '%api.whatsapp.com%'
            AND ad_text NOT ILIKE '%wa.me%'
            AND ad_text NOT ILIKE '%fale com a gente no whatsapp%'
            AND ad_text NOT ILIKE '%enviar mensagem pelo whatsapp%'
            AND ad_text NOT ILIKE '%entre em contato pelo whatsapp%'
            AND (
                ad_text ILIKE '%comprar agora%'
                OR ad_text ILIKE '%compre já%'
                OR ad_text ILIKE '%adicionar ao carrinho%'
                OR ad_text ILIKE '%ver oferta%'
                OR ad_text ILIKE '%aproveitei%'
                OR ad_text ILIKE '%desconto%'
                OR ad_text ILIKE '%promoção%'
                OR ad_text ILIKE '%frete grátis%'
                OR ad_text ILIKE '%entrega%'
                OR ad_text ILIKE '%loja%'
                OR ad_text ILIKE '%site%'
                OR ad_text ILIKE '%www.%'
                OR ad_text ILIKE '%.com.br%'
                OR ad_text ILIKE '%consulta%'
                OR ad_text ILIKE '%agendamento%'
                OR ad_text ILIKE '%clínica%'
                OR ad_text ILIKE '%médico%'
                OR ad_text ILIKE '%especialista%'
            )
        )
    );

-- Log da operação
INSERT INTO public.migration_logs (
    migration_name,
    description,
    executed_at,
    records_affected
) 
SELECT 
    'fix_false_positive_whatsapp_v3_8_5',
    'Correção de falsos positivos WhatsApp - anúncios de e-commerce e consultas classificados incorretamente',
    NOW(),
    (SELECT COUNT(*) 
     FROM ads 
     WHERE link_type = 'unknown' 
     AND updated_at > NOW() - INTERVAL '1 minute'
    );

-- Verificar resultado da migração
SELECT 
    'RESULTADO DA MIGRAÇÃO v3.8.5' as info,
    COUNT(*) as anuncios_corrigidos
FROM ads 
WHERE 
    link_type = 'unknown' 
    AND updated_at > NOW() - INTERVAL '1 minute';

-- Estatísticas após correção
SELECT 
    'ESTATÍSTICAS APÓS CORREÇÃO' as info,
    link_type,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual
FROM ads 
WHERE ad_url IS NOT NULL
GROUP BY link_type
ORDER BY quantidade DESC; 