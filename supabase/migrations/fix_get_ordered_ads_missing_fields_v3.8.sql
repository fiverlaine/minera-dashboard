-- Migração v3.8 - Correção da função get_ordered_ads
-- Data: Janeiro 2025  
-- Objetivo: Adicionar campos ad_url e link_type que estavam ausentes na função get_ordered_ads

-- PROBLEMA IDENTIFICADO:
-- A função get_ordered_ads (usada pelos filtros "trending" e "weekly") não retornava 
-- os campos ad_url e link_type, fazendo anúncios aparecerem como "Sem Link" 
-- mesmo quando tinham links válidos.

-- CORREÇÃO: Recriar função incluindo todos os campos necessários

CREATE OR REPLACE FUNCTION get_ordered_ads(
    p_user_id uuid,
    p_filter_type text,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE (
    id bigint,
    created_at timestamp with time zone,
    user_id uuid,
    advertiser_name text,
    description text,
    thumbnail_url text,
    video_url text,
    likes integer,
    comments integer,
    shares integer,
    views integer,
    platform text,
    country text,
    ad_id text,
    uses_count integer,
    category text,
    title text,
    is_active boolean,
    page_url text,
    ad_url text,         -- ✅ CAMPO ADICIONADO
    link_type text       -- ✅ CAMPO ADICIONADO
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.created_at,
        a.user_id,
        a.advertiser_name,
        a.description,
        a.thumbnail_url,
        a.video_url,
        a.likes,
        a.comments,
        a.shares,
        a.views,
        a.platform,
        a.country,
        a.ad_id,
        a.uses_count,
        a.category,
        a.title,
        a.is_active,
        a.page_url,
        a.ad_url,          -- ✅ CAMPO ADICIONADO
        a.link_type        -- ✅ CAMPO ADICIONADO
    FROM
        ads a
    WHERE
        a.user_id = p_user_id AND
        (
            (p_filter_type = 'trending' AND a.uses_count > 0) OR
            (p_filter_type = 'weekly' AND a.created_at >= (NOW() - INTERVAL '7 days'))
        ) AND
        -- Filtrar anunciantes inválidos (mesmo filtro da extensão)
        a.advertiser_name IS NOT NULL AND
        a.advertiser_name != '' AND
        LOWER(a.advertiser_name) NOT IN ('anunciante desconhecido', 'unknown advertiser', 'patrocinado', 'sponsored')
    ORDER BY
        a.uses_count DESC,
        a.created_at DESC,
        a.id DESC
    LIMIT
        p_limit
    OFFSET
        p_offset;
END;
$$ LANGUAGE plpgsql;

-- Comentário da migração
COMMENT ON FUNCTION get_ordered_ads(uuid, text, integer, integer) IS 
'v3.8 - Função corrigida para incluir campos ad_url e link_type ausentes. Resolve problema de anúncios aparecerem como "Sem Link" nos filtros trending/weekly.'; 