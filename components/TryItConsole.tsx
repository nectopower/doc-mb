'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Loader2, Save, Trash2, RefreshCw, Copy, Check } from 'lucide-react'
import { generateExampleFromSchema } from '@/lib/swagger'
import { authService } from '@/lib/auth'

interface TryItConsoleProps {
  method: string
  path: string
  parameters?: any[]
  requestBody?: any
}

export default function TryItConsole({ method, path, parameters = [], requestBody }: TryItConsoleProps) {
  const [token, setToken] = useState('')
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [bodyValue, setBodyValue] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'params' | 'body' | 'auth'>('params')
  const [copied, setCopied] = useState(false)

  // Initialize body with example if available
  useEffect(() => {
    if (requestBody) {
      const schema = requestBody.content?.['application/json']?.schema;
      if (schema) {
        const example = generateExampleFromSchema(schema);
        setBodyValue(JSON.stringify(example, null, 2))
      }
    }
  }, [requestBody])

  // Função para buscar token de múltiplas chaves
  const getTokenFromStorage = useCallback(() => {
    return (
      localStorage.getItem('api_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('api_access_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token') ||
      ''
    )
  }, [])

  // Função para salvar token em múltiplas chaves
  const saveTokenToStorage = useCallback((tokenValue: string) => {
    if (!tokenValue) return
    localStorage.setItem('api_token', tokenValue)
    localStorage.setItem('accessToken', tokenValue)
    localStorage.setItem('api_access_token', tokenValue)
    // Também salvar nas outras chaves para compatibilidade
    localStorage.setItem('auth_token', tokenValue)
    localStorage.setItem('access_token', tokenValue)
  }, [])

  // Load token from localStorage (verifica múltiplas chaves para compatibilidade)
  useEffect(() => {
    const savedToken = getTokenFromStorage()
    if (savedToken) {
      setToken(savedToken)
      console.log('[TryItConsole] Token carregado automaticamente do localStorage')
    }
  }, [getTokenFromStorage])

  // Listener para mudanças no localStorage (detecta login em outra aba/janela)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Verificar se alguma chave de token foi atualizada
      const tokenKeys = ['accessToken', 'api_token', 'api_access_token', 'auth_token', 'access_token']
      if (e.key && tokenKeys.includes(e.key) && e.newValue) {
        console.log('[TryItConsole] Token atualizado detectado no localStorage:', e.key)
        setToken(e.newValue)
        saveTokenToStorage(e.newValue)
      }
    }

    // Listener para mensagens de outras origens (compartilhamento entre aplicações)
    const handleMessage = (event: MessageEvent) => {
      // Aceitar mensagens de localhost:7777 (aplicação principal) ou localhost:3000
      if (
        (event.origin.includes('localhost:7777') || event.origin.includes('localhost:3000')) &&
        event.data?.type === 'TOKEN_UPDATE' &&
        event.data?.token
      ) {
        console.log('[TryItConsole] Token recebido via postMessage de outra aplicação')
        setToken(event.data.token)
        saveTokenToStorage(event.data.token)
      }
    }

    // Listener para evento customizado de atualização de token
    const handleTokenUpdate = (event: CustomEvent) => {
      if (event.detail?.accessToken) {
        console.log('[TryItConsole] Token atualizado via evento customizado')
        setToken(event.detail.accessToken)
        saveTokenToStorage(event.detail.accessToken)
      }
    }

    // Listener para mudanças entre abas/janelas
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('message', handleMessage)
    window.addEventListener('tokenUpdated', handleTokenUpdate as EventListener)

    // Polling para detectar mudanças na mesma aba (localStorage não dispara evento storage na mesma aba)
    const pollInterval = setInterval(() => {
      const currentToken = getTokenFromStorage()
      if (currentToken && currentToken !== token) {
        console.log('[TryItConsole] Novo token detectado via polling')
        setToken(currentToken)
      }
    }, 1000) // Verificar a cada 1 segundo

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('tokenUpdated', handleTokenUpdate as EventListener)
      clearInterval(pollInterval)
    }
  }, [token, getTokenFromStorage, saveTokenToStorage])

  // Save token to localStorage (salva em múltiplas chaves para compatibilidade)
  const handleSaveToken = () => {
    if (!token) {
      alert('Por favor, insira um token antes de salvar.')
      return
    }
    saveTokenToStorage(token)
    alert('Token salvo no navegador!')
  }

  // Função para refresh automático do token usando authService
  const handleRefreshToken = async () => {
    setLoading(true)
    try {
      const refreshed = await authService.refreshAccessToken()
      if (refreshed) {
        const newToken = authService.getAccessToken()
        if (newToken) {
          setToken(newToken)
          saveTokenToStorage(newToken)
          alert('Token renovado com sucesso!')
        }
      } else {
        alert('Não foi possível renovar o token. Faça login novamente.')
      }
    } catch (error: any) {
      console.error('Erro ao renovar token:', error)
      alert(`Erro ao renovar token: ${error.message}. Faça login novamente.`)
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async () => {
    setLoading(true)
    setResponse(null)
    
    try {
      // Replace path parameters
      let finalPath = path
      const queryParams = new URLSearchParams()

      // Group parameters
      parameters.forEach(param => {
        const value = paramValues[param.name]
        if (!value) return

        if (param.in === 'path') {
          finalPath = finalPath.replace(`{${param.name}}`, value)
        } else if (param.in === 'query') {
          queryParams.append(param.name, value)
        }
      })

      const queryString = queryParams.toString()
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api'}${finalPath}${queryString ? `?${queryString}` : ''}`

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const startTime = performance.now()
      const res = await fetch(url, {
        method: method.toUpperCase(),
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? bodyValue : undefined
      })
      const endTime = performance.now()

      const data = await res.json().catch(() => null)
      
      // Auto-save token if detected in response (e.g. login/register)
      if (data) {
        let newToken = '';
        if (data.token) newToken = data.token;
        else if (data.accessToken) newToken = data.accessToken;
        else if (data.data?.token) newToken = data.data.token;
        else if (data.data?.accessToken) newToken = data.data.accessToken;
        else if (data.data?.tokens?.accessToken) newToken = data.data.tokens.accessToken;
        else if (data.tokens?.accessToken) newToken = data.tokens.accessToken;

        if (newToken) {
          setToken(newToken);
          saveTokenToStorage(newToken);
          console.log('[TryItConsole] Token salvo automaticamente da resposta')
        }
      }

      // Se receber 401, tentar refresh automático do token via authService
      if (res.status === 401 && token) {
        console.log('[TryItConsole] Token expirado, tentando refresh automático...')
        const refreshed = await authService.refreshAccessToken()
        if (refreshed) {
          const newAccessToken = authService.getAccessToken()
          if (newAccessToken) {
            setToken(newAccessToken)
            saveTokenToStorage(newAccessToken)

            // Retry com novo token
            const retryRes = await fetch(url, {
              method: method.toUpperCase(),
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newAccessToken}` },
              body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? bodyValue : undefined
            })
            const retryData = await retryRes.json().catch(() => null)

            setResponse({
              status: retryRes.status,
              statusText: retryRes.statusText,
              time: Math.round(performance.now() - startTime),
              data: retryData,
              autoRefreshed: true
            })
            return
          }
        }
      }
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: Math.round(endTime - startTime),
        data
      })

    } catch (error: any) {
      setResponse({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const hasParams = parameters.length > 0
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())

  // Auto-select tab based on requirements
  useEffect(() => {
    if (!hasParams && hasBody) setActiveTab('body')
  }, [hasParams, hasBody])

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-slate-300 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Playground
        </h3>
        <button
          onClick={handleExecute}
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Executar
        </button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {hasParams && (
          <button
            onClick={() => setActiveTab('params')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'params' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            Parâmetros
          </button>
        )}
        {hasBody && (
          <button
            onClick={() => setActiveTab('body')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'body' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            Body
          </button>
        )}
        <button
          onClick={() => setActiveTab('auth')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'auth' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
        >
          Autenticação
        </button>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900/50">
        {activeTab === 'params' && hasParams && (
          <div className="space-y-4">
            {parameters.map((param) => (
              <div key={param.name} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono">
                  {param.name}
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  placeholder={param.description || `Valor para ${param.name}`}
                  value={paramValues[param.name] || ''}
                  onChange={(e) => setParamValues(prev => ({ ...prev, [param.name]: e.target.value }))}
                  className="col-span-2 px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'body' && hasBody && (
          <textarea
            value={bodyValue}
            onChange={(e) => setBodyValue(e.target.value)}
            className="w-full h-64 font-mono text-sm p-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y"
            spellCheck={false}
          />
        )}

        {activeTab === 'auth' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bearer Token
                {token && (
                  <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                    ✓ Token configurado
                  </span>
                )}
                {!token && (
                  <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-normal">
                    ⚠ Token necessário para esta requisição
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole seu token JWT aqui ou faça login na aplicação principal..."
                  className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                    token 
                      ? 'border-green-300 dark:border-green-700' 
                      : 'border-slate-300 dark:border-slate-700'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`}
                />
                <button
                  onClick={handleSaveToken}
                  disabled={!token}
                  className="p-2 text-slate-700 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Salvar Token"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRefreshToken}
                  disabled={loading}
                  className="p-2 text-slate-700 dark:text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Renovar Token (Refresh)"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => { 
                    setToken(''); 
                    // Limpar todas as chaves de token
                    localStorage.removeItem('api_token');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('api_access_token');
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('access_token');
                  }}
                  disabled={!token}
                  className="p-2 text-slate-700 dark:text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Limpar Token"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {token 
                  ? 'Token configurado. O token será salvo no navegador para futuras requisições. Use o botão de refresh para renovar automaticamente.'
                  : (
                    <>
                      Faça login na{' '}
                      <a href="/login" className="text-primary hover:underline font-medium">
                        página de login
                      </a>
                      {' '}ou cole seu token JWT aqui. O token será detectado automaticamente se você já estiver logado na aplicação principal (localhost:7777).
                    </>
                  )
                }
              </p>
              {token && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Dica:</strong> Se o token expirar, o sistema tentará renová-lo automaticamente. 
                    Você também pode usar o botão de refresh (🔄) para renovar manualmente.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {response && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                response.status >= 200 && response.status < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                response.status >= 400 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                {response.status} {response.statusText}
              </span>
              {response.autoRefreshed && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  🔄 Token renovado automaticamente
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const text = response.data ? JSON.stringify(response.data, null, 2) : response.error || '';
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                title="Copiar resposta"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {response.time}ms
              </span>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-950 overflow-x-auto max-h-96">
            <pre className="text-xs font-mono text-slate-900 dark:text-slate-300">
              {response.data ? JSON.stringify(response.data, null, 2) : response.error || 'No content'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
