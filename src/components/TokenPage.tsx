import React, { useState } from 'react'
import { 
  Copy, 
  RefreshCw, 
  Key, 
  Check, 
  AlertCircle,
  Info,
  Shield,
  Chrome
} from 'lucide-react'
import { useToken } from '../hooks/useToken'
import { useAuth } from '../contexts/AuthContext'

export const TokenPage: React.FC = () => {
  const { token, loading, error, regenerateToken, copyToken } = useToken()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const handleCopyToken = async () => {
    await copyToken()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerateToken = async () => {
    if (confirm('Tem certeza que deseja regenerar o token? O token atual será invalidado.')) {
      setRegenerating(true)
      try {
        await regenerateToken()
      } finally {
        setRegenerating(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando token...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Erro ao carregar token</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center">
            <Key className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Token de Acesso</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Use este token para conectar a extensão Minera ao seu dashboard. 
          Mantenha-o seguro e não compartilhe com terceiros.
        </p>
      </div>

      {/* Token Card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Seu Token</h2>
            <p className="text-gray-400 text-sm">
              Autenticado como: <span className="text-blue-400 font-medium">{user?.email}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-green-500 text-sm font-medium">Ativo</span>
          </div>
        </div>

        {/* Token Display */}
        <div className="bg-gray-900 rounded-lg border border-gray-600 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cole sua chave:
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={token || ''}
              readOnly
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              placeholder="Carregando token..."
            />
            <button
              onClick={handleCopyToken}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
              disabled={!token}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleRegenerateToken}
            disabled={regenerating}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Regenerando...' : 'Regenerar Token'}</span>
          </button>

          <div className="text-right">
            <p className="text-gray-500 text-xs">
              Token criado em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Como usar */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Chrome className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Como usar na extensão</h3>
          </div>
          <ol className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start space-x-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <span>Abra a extensão Minera no seu navegador</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <span>Clique no campo "Cole sua chave"</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <span>Cole o token copiado e clique em "Entrar"</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
              <span>A extensão estará conectada ao seu dashboard</span>
            </li>
          </ol>
        </div>

        {/* Segurança */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Info className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Informações importantes</h3>
          </div>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
              <span>Mantenha seu token em segurança e não compartilhe com terceiros</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
              <span>Se suspeitar que seu token foi comprometido, regenere-o imediatamente</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
              <span>O token é único para sua conta e permite acesso aos seus dados</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
              <span>Regenerar o token invalidará o anterior permanentemente</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 