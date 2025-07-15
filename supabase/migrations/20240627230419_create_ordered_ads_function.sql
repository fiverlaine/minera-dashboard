create or replace function get_ordered_ads(
    p_user_id uuid,
    p_filter_type text,
    p_limit integer,
    p_offset integer
)
returns table (
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
    page_url text
) as $$
begin
    return query
    select
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
        a.page_url
    from
        ads a
    where
        a.user_id = p_user_id and
        (
            (p_filter_type = 'trending' and a.uses_count > 0) or
            (p_filter_type = 'weekly' and a.created_at >= (now() - interval '7 days'))
        ) and
        -- Filtrar anunciantes inválidos (mesmo filtro da extensão)
        a.advertiser_name is not null and
        a.advertiser_name != '' and
        lower(a.advertiser_name) not in ('anunciante desconhecido', 'unknown advertiser', 'patrocinado', 'sponsored')
    order by
        a.uses_count desc,
        a.created_at desc,
        a.id desc
    limit
        p_limit
    offset
        p_offset;
end;
$$ language plpgsql;

-- Função para contar total de anúncios da semana (não anunciantes únicos)
create or replace function get_weekly_ads_count(p_user_id uuid)
returns bigint as $$
begin
    return (
        select count(*)
        from ads a
        where 
            a.user_id = p_user_id and
            a.created_at >= (now() - interval '7 days') and
            a.advertiser_name is not null and
            a.advertiser_name != '' and
            lower(a.advertiser_name) not in ('anunciante desconhecido', 'unknown advertiser', 'patrocinado', 'sponsored')
    );
end;
$$ language plpgsql; 