import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Clock,
  Globe,
  MessageCircle, // Para WhatsApp
  Instagram, // Para Instagram
  Send, // Para Telegram
  ShoppingCart, // Para E-commerce
  Maximize, // Para fullscreen
  Minimize, // Para sair do fullscreen
  X, // Para fechar modal
  BookOpen, // Para biblioteca
  ExternalLink // Para links externos
} from 'lucide-react'
import { supabase } from '../config/supabase'


interface AdCardProps {
  ad: {
    id: number
    library_id: string
    title: string
    description: string | null
    advertiser_name: string
    page_name?: string | null
    page_photo_url?: string | null // NOVO: Foto da página
    video_url?: string | null
    thumbnail_url?: string | null
    start_date?: string | null
    end_date?: string | null
    uses_count?: number
    category?: string | null
    country?: string | null
    language?: string | null
    page_url?: string | null
    ad_url?: string | null
    link_type?: string | null
    created_at: string
  }
  showRemoveFavorite?: boolean
  onRemoveFavorite?: (adId: number) => void
}

export const AdCard: React.FC<AdCardProps> = ({ ad, showRemoveFavorite, onRemoveFavorite }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [removingFavorite, setRemovingFavorite] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [checkoutLinks, setCheckoutLinks] = useState<Array<{
    href: string
    text: string
    score: number
    type: 'checkout' | 'cart' | 'product' | 'shop'
    reason: string
  }>>([])
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const modalVideoRef = useRef<HTMLVideoElement>(null)

  const hasVideo = ad.video_url && ad.video_url.trim() !== ''
  const hasImage = ad.thumbnail_url && ad.thumbnail_url.trim() !== ''

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isModalOpen])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
    
    // Sincronizar estado do vídeo principal com o modal
    if (!isModalOpen) {
      setTimeout(() => {
        const modalVideo = modalVideoRef.current
        const mainVideo = videoRef.current
        if (modalVideo && mainVideo) {
          modalVideo.currentTime = mainVideo.currentTime
          modalVideo.muted = mainVideo.muted
          if (isPlaying) {
            modalVideo.play()
          }
        }
      }, 100)
    } else {
      // Sincronizar de volta quando fechar o modal
      const modalVideo = modalVideoRef.current
      const mainVideo = videoRef.current
      if (modalVideo && mainVideo) {
        mainVideo.currentTime = modalVideo.currentTime
        mainVideo.muted = modalVideo.muted
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const downloadMedia = async () => {
    const mediaUrl = hasVideo ? ad.video_url : ad.thumbnail_url
    if (!mediaUrl) return

    try {
      setDownloading(true)
      const fileName = `minera_${hasVideo ? 'video' : 'image'}_${ad.library_id}.${hasVideo ? 'mp4' : 'jpg'}`

      // Método 1: Tentar via Edge Function (proxy que contorna CORS)
      try {
        console.log('Tentando download via Edge Function (proxy)...')
        const proxyUrl = 'https://ttqahrjujapdduubxlvd.supabase.co/functions/v1/download-media'
        
        // Obter token de autenticação do usuário
        const { data: { session } } = await supabase.auth.getSession()
        const authToken = session?.access_token

        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cWFocmp1amFwZGR1dWJ4bHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTYxOTYsImV4cCI6MjA2NjM3MjE5Nn0.Mt1t-CvotUR0M0LZCNF-lp2ql578B0X1rASGoCxk3to'
          },
          body: JSON.stringify({
            url: mediaUrl,
            filename: fileName
          })
        })

        if (response.ok) {
          // A Edge Function retorna o arquivo como blob
          const blob = await response.blob()
          const blobUrl = URL.createObjectURL(blob)
          
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = fileName
          link.style.display = 'none'
          
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          URL.revokeObjectURL(blobUrl)
          console.log('Download via Edge Function bem-sucedido!')
          return // Sucesso - não precisa tentar outros métodos
        } else {
          console.log('Edge Function retornou erro:', response.status)
        }
      } catch (proxyError) {
        console.log('Edge Function falhou:', proxyError)
      }

      // Método 2: Tentar fetch + blob direto (pode falhar com CORS)
      try {
        console.log('Tentando download via fetch + blob direto...')
        const response = await fetch(mediaUrl, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': hasVideo ? 'video/*' : 'image/*'
          }
        })

        if (response.ok) {
          const blob = await response.blob()
          const blobUrl = URL.createObjectURL(blob)
          
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = fileName
          link.style.display = 'none'
          
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          URL.revokeObjectURL(blobUrl)
          console.log('Download via fetch+blob bem-sucedido!')
          return // Sucesso - não precisa tentar outros métodos
        }
      } catch (corsError) {
        console.log('Fetch+blob falhou (CORS bloqueado), tentando método tradicional...')
      }

      // Método 3: Download direto via <a download> (funciona para alguns casos)
      try {
        console.log('Tentando download direto...')
        const link = document.createElement('a')
        link.href = mediaUrl
        link.download = fileName
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Dar tempo para o download processar
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Download direto tentado!')
        return // Assumir sucesso
      } catch (downloadError) {
        console.log('Download direto falhou, tentando último método...')
      }

      // Método 4: Abrir em nova aba como último recurso
      console.log('Abrindo mídia em nova aba para download manual...')
      window.open(mediaUrl, '_blank', 'noopener,noreferrer')
      
      // Mostrar instrução para o usuário
      alert('📥 Arquivo aberto em nova aba!\n\nPara baixar:\n• Clique com botão direito na mídia\n• Selecione "Salvar como..."\n• Escolha onde salvar o arquivo')
      
    } catch (error) {
      console.error('Erro geral no download:', error)
      alert(`❌ Erro ao processar download: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\nTente novamente ou abra o link manualmente.`)
    } finally {
      setDownloading(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }



  const getDaysAgo = (dateString: string) => {
    const adDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - adDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded)
  }

  const getDescription = () => {
    return ad.description || ad.title || 'Sem descrição'
  }

  const hasLongDescription = () => {
    const description = getDescription()
    return description.length > 150 // Considera longo se tiver mais de 150 caracteres
  }

  const visitLibrary = () => {
    // 1. Tentar extrair page_id da URL da página
    let pageId = null
    if (ad.page_url) {
      pageId = extractPageIdFromUrl(ad.page_url)
    }
    // 2. Se não houver, tentar usar library_id ou id (se forem IDs do Facebook)
    if (!pageId) {
      if (ad.library_id && /^\d{6,}$/.test(ad.library_id)) {
        pageId = ad.library_id
      } else if (ad.id && typeof ad.id === 'number' && ad.id > 100000) {
        pageId = ad.id.toString()
      }
    }
    // 3. Se encontrou pageId, abrir biblioteca da página
    if (pageId) {
      const libraryUrl = `https://facebook.com/ads/library/?id=${pageId}`
      window.open(libraryUrl, '_blank', 'noopener,noreferrer')
      // Notificação visual (opcional)
      if (window?.Notification && Notification.permission === 'granted') {
        new Notification(`📚 Biblioteca da página aberta!`)
      }
    } else {
      alert('❌ Não foi possível identificar a página do Facebook para este anúncio.')
    }
  }

  const extractPageIdFromUrl = (url: string): string | null => {
    try {
      // Padrões de URL do Facebook para extrair page_id
      const patterns = [
        // https://www.facebook.com/people/Nome/123456789/
        /facebook\.com\/people\/[^\/]+\/(\d+)/,
        // https://www.facebook.com/profile.php?id=123456789
        /facebook\.com\/profile\.php\?id=(\d+)/,
        // https://www.facebook.com/pages/Nome/123456789
        /facebook\.com\/pages\/[^\/]+\/(\d+)/,
        // https://www.facebook.com/123456789
        /facebook\.com\/(\d+)$/
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }
      
      return null
    } catch (error) {
      console.error('Erro ao extrair page_id:', error)
      return null
    }
  }

  const visitSite = () => {
    if (ad.ad_url) {
      // Usar o link real do produto capturado da biblioteca do Facebook
      window.open(ad.ad_url, '_blank', 'noopener,noreferrer')
    } else {
      alert('Link do site não disponível para este anúncio')
    }
  }

  // NOVO: Função para obter informações do botão baseado no tipo de link
  const getLinkButtonInfo = () => {
    if (!ad.ad_url) {
      return {
        icon: Globe,
        text: 'Sem Link',
        color: 'bg-gray-600 hover:bg-gray-700',
        disabled: true
      }
    }

    switch (ad.link_type) {
      case 'whatsapp':
      case 'whatsapp_api':
        return {
          icon: MessageCircle,
          text: 'WhatsApp',
          color: 'bg-green-600 hover:bg-green-700'
        }
      case 'instagram':
        return {
          icon: Instagram,
          text: 'Instagram',
          color: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        }
      case 'telegram':
        return {
          icon: Send,
          text: 'Telegram',
          color: 'bg-blue-500 hover:bg-blue-600'
        }
      case 'ecommerce':
        return {
          icon: ShoppingCart,
          text: 'Loja',
          color: 'bg-orange-600 hover:bg-orange-700'
        }
      case 'website':
      default:
        return {
          icon: Globe,
          text: 'Visitar Site',
          color: 'bg-green-600 hover:bg-green-700'
        }
    }
  }

  const linkButtonInfo = getLinkButtonInfo()

  const handleRemoveFavorite = async () => {
    if (!onRemoveFavorite || removingFavorite) return
    
    try {
      setRemovingFavorite(true)
      await onRemoveFavorite(ad.id)
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
    } finally {
      setRemovingFavorite(false)
    }
  }

  return (
    <>
    <div className="relative bg-dark-secondary rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Botão de remover favorito */}
      {showRemoveFavorite && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleRemoveFavorite}
            disabled={removingFavorite}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              removingFavorite 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-red-500 hover:bg-red-600 hover:scale-110'
            } shadow-lg`}
            title="Remover dos favoritos"
          >
            {removingFavorite ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <X className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      )}

      {/* Header com informações da página */}
      <div className="px-4 py-4 bg-dark-tertiary border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Foto da página */}
            {ad.page_photo_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                <img 
                  src={ad.page_photo_url} 
                  alt={ad.page_name || ad.advertiser_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center">
                <span className="text-gray-300 text-xs font-bold">
                  {(ad.page_name || ad.advertiser_name).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Nome da página e contador */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                
                <span className="text-sm font-medium text-white">
                  {ad.page_name || ad.advertiser_name}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-bold text-sm" style={{color: '#1351ff'}}>
                  {ad.uses_count || 1} anúncios
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mídia */}
      <div 
        className="relative bg-black aspect-video group/media"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {hasVideo ? (
          <>
            <video
              ref={videoRef}
              src={ad.video_url || ''}
              poster={ad.thumbnail_url || ''}
              className="w-full h-full object-cover"
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Overlay de controles */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              {/* Botão play central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>
              </div>

              {/* Controles inferiores */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2 text-white text-xs">
                  <span>{formatTime(currentTime)}</span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={duration ? (currentTime / duration) * 100 : 0}
                      onChange={handleSeek}
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                    />
                  </div>
                  <span>{formatTime(duration)}</span>
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleModal}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {isModalOpen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : hasImage ? (
          <img
            src={ad.thumbnail_url || ''}
            alt={ad.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder-image.jpg'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted bg-dark-tertiary">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem mídia disponível</p>
            </div>
          </div>
        )}
      </div>

             {/* Conteúdo Principal */}
       <div className="p-4">
         {/* Descrição do anúncio */}
         <p className={`text-text-secondary text-sm leading-relaxed mb-4 ${
           isDescriptionExpanded ? '' : 'line-clamp-3'
         }`}>
           {getDescription()}
         </p>

         {/* Links de ação */}
         {hasLongDescription() && (
           <div className="flex items-center gap-2 mb-4">
             <button 
               onClick={toggleDescription}
               className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
             >
               {isDescriptionExpanded ? 'ver menos' : 'ver mais'}
             </button>
           </div>
         )}

        {/* Botões de ação */}
        <div className="space-y-3">
          {/* Botão de download */}
          <button
            onClick={downloadMedia}
            disabled={downloading}
            className={`w-full py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium border ${
              downloading 
                ? 'bg-blue-600 text-white border-blue-600 cursor-not-allowed' 
                : 'bg-dark-tertiary hover:bg-dark-hover text-text-primary border-dark-border hover:border-accent-blue/30'
            }`}
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Baixando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Baixar anúncio
              </>
            )}
          </button>

          {/* Botões de visita */}
          <div className="grid grid-cols-2 gap-2">
            {/* Botão Ver Biblioteca */}
            <button
              onClick={() => visitLibrary()}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Ver Biblioteca
            </button>

            {/* Botão Dinâmico baseado no tipo de link */}
            <button
              onClick={() => visitSite()}
              disabled={linkButtonInfo.disabled}
              className={`${linkButtonInfo.color} ${linkButtonInfo.disabled ? 'opacity-50 cursor-not-allowed' : ''} text-white py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium`}
            >
              <linkButtonInfo.icon className="w-4 h-4" />
              {linkButtonInfo.text}
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{getDaysAgo(ad.created_at)} dias</span>
          </div>
        </div>
      </div>

      {/* Informações do anunciante (pequeno, discreto) */}
      <div className="px-4 pb-3">
        <div className="text-xs text-text-muted"> 
        </div>
      </div>
    </div>

    {/* Modal de Vídeo */}
    <AnimatePresence>
      {isModalOpen && hasVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-6xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Vídeo no Modal */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
              <video
                ref={modalVideoRef}
                src={ad.video_url || ''}
                poster={ad.thumbnail_url || ''}
                className="w-full h-auto max-h-[80vh] object-contain"
                controls
                autoPlay={isPlaying}
                muted={isMuted}
                style={{ aspectRatio: '16/9' }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
} 