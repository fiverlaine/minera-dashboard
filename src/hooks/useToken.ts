import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../contexts/AuthContext'

interface UseTokenReturn {
  token: string | null
  loading: boolean
  error: string | null
  regenerateToken: () => Promise<void>
  copyToken: () => Promise<void>
}

export const useToken = (): UseTokenReturn => {
  const { user } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchToken = async () => {
    if (!user) {
      setToken(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Primeiro, tentar buscar token existente
      const { data: existingToken, error: fetchError } = await supabase
        .from('user_tokens')
        .select('token')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (existingToken && !fetchError) {
        setToken(existingToken.token)
        return
      }

      // Se não encontrou token, gerar um novo usando a função do banco
      const { data: newTokenData, error: generateError } = await supabase
        .rpc('get_or_create_user_token', { user_uuid: user.id })

      if (generateError) throw generateError

      setToken(newTokenData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar token')
    } finally {
      setLoading(false)
    }
  }

  const regenerateToken = async () => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      setLoading(true)
      setError(null)

      // Desativar token atual
      await supabase
        .from('user_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id)

      // Gerar novo token
      const { data: newTokenData, error: generateError } = await supabase
        .rpc('get_or_create_user_token', { user_uuid: user.id })

      if (generateError) throw generateError

      setToken(newTokenData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao regenerar token')
    } finally {
      setLoading(false)
    }
  }

  const copyToken = async () => {
    if (!token) return

    try {
      await navigator.clipboard.writeText(token)
      // Você pode adicionar uma notificação aqui se desejar
    } catch (err) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = token
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  useEffect(() => {
    fetchToken()
  }, [user])

  return {
    token,
    loading,
    error,
    regenerateToken,
    copyToken
  }
} 