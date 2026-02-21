'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isEndpointAllowed, getUserTypeFromToken } from '@/lib/endpoint-permissions'
import { authService } from '@/lib/auth'
import { AlertCircle } from 'lucide-react'

interface EndpointGuardProps {
  tag: string
  path?: string
  children: React.ReactNode
}

/**
 * Componente que verifica se o usuário tem permissão para acessar um endpoint
 */
export default function EndpointGuard({ tag, path, children }: EndpointGuardProps) {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    const token = authService.getAccessToken()
    const user = authService.getUser()
    
    const typeFromToken = getUserTypeFromToken(token)
    const finalUserType = typeFromToken || user?.userType || null
    setUserType(finalUserType)

    if (finalUserType) {
      const allowed = isEndpointAllowed(finalUserType as any, tag, path)
      setHasAccess(allowed)
    } else {
      // Sem login, apenas autenticação é permitida
      setHasAccess(tag === 'Autenticação')
    }
  }, [tag, path])

  if (hasAccess === null) {
    // Ainda verificando...
    return null
  }

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Acesso Restrito
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                Você não tem permissão para acessar este endpoint com seu tipo de usuário atual.
              </p>
              {userType && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
                  Tipo de usuário: <strong>{userType}</strong>
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/reference')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                >
                  Voltar para Referência
                </button>
                {!userType && (
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                  >
                    Fazer Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
