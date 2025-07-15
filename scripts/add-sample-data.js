// Script para adicionar dados de exemplo ao dashboard
// Execute: node scripts/add-sample-data.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ttqahrjujapdduubxlvd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cWFocmp1amFwZGR1dWJ4bHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTYxOTYsImV4cCI6MjA2NjM3MjE5Nn0.Mt1t-CvotUR0M0LZCNF-lp2ql578B0X1rASGoCxk3to'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const sampleAds = [
  {
    library_id: 'FB_001',
    title: 'Perca até 5kg em 7 dias: Método eficaz de emagrecimento',
    description: 'Descubra o método revolucionário que está transformando vidas. Resultados garantidos em apenas 7 dias.',
    advertiser_name: 'EmagreceRápido',
    page_name: 'Emagrece Rápido - Oficial',
    video_url: 'https://example.com/video1.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
    uses_count: 15,
    category: 'Saúde',
    country: 'BR',
    language: 'pt'
  },
  {
    library_id: 'FB_002',
    title: 'Pulse Quanta: Suplemento em Cápsulas',
    description: 'O suplemento mais avançado do mercado. Energia e disposição para o seu dia.',
    advertiser_name: 'NutriMax',
    page_name: 'NutriMax Suplementos',
    video_url: 'https://example.com/video2.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1576017349593-903d7a110ca9?w=500',
    uses_count: 28,
    category: 'Fitness',
    country: 'BR',
    language: 'pt'
  },
  {
    library_id: 'FB_003',
    title: 'Curso de Investimentos: Do Zero ao Milhão',
    description: 'Aprenda a investir como os profissionais. Estratégias comprovadas para multiplicar seu dinheiro.',
    advertiser_name: 'InvestPro',
    page_name: 'InvestPro Academy',
    video_url: 'https://example.com/video3.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500',
    uses_count: 42,
    category: 'Finanças',
    country: 'BR',
    language: 'pt'
  },
  {
    library_id: 'FB_004',
    title: 'iPhone 15 Pro Max - Oferta Limitada',
    description: 'Garante já o seu iPhone 15 Pro Max com desconto exclusivo. Últimas unidades disponíveis.',
    advertiser_name: 'TechStore',
    page_name: 'TechStore Brasil',
    video_url: 'https://example.com/video4.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=500',
    uses_count: 8,
    category: 'Tecnologia',
    country: 'BR',
    language: 'pt'
  },
  {
    library_id: 'FB_005',
    title: 'Transforme seu Corpo em 30 Dias',
    description: 'Método exclusivo para ganhar massa muscular rapidamente. Resultados visíveis em 30 dias.',
    advertiser_name: 'FitnessPro',
    page_name: 'FitnessPro Training',
    video_url: 'https://example.com/video5.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
    uses_count: 22,
    category: 'Fitness',
    country: 'BR',
    language: 'pt'
  }
]

async function addSampleData() {
  try {
    console.log('🚀 Adicionando dados de exemplo...')
    
    // Primeiro, vamos criar um usuário de teste
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@minera.com',
      password: 'minera123',
      options: {
        data: {
          full_name: 'Usuário de Teste'
        }
      }
    })

    if (authError && authError.message !== 'User already registered') {
      throw authError
    }

    console.log('✅ Usuário de teste criado/verificado')

    // Agora vamos adicionar os anúncios de exemplo
    // Nota: Como temos RLS, precisaríamos do token do usuário
    // Para este exemplo, vamos usar o service role
    
    for (const ad of sampleAds) {
      const { data, error } = await supabase
        .from('ads')
        .insert(ad)
        .select()

      if (error) {
        console.error(`❌ Erro ao adicionar anúncio ${ad.title}:`, error)
      } else {
        console.log(`✅ Anúncio adicionado: ${data[0].title}`)
      }
    }

    console.log('🎉 Dados de exemplo adicionados com sucesso!')
    console.log('📧 Login: test@minera.com')
    console.log('🔑 Senha: minera123')

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

addSampleData() 