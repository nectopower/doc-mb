'use client';

/**
 * Contexto de Autenticação
 * Provê estado e funções de autenticação para toda a aplicação
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, LoginRequest, AuthResponse } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  switchUser: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Não podemos usar useRouter aqui porque é um Provider (server component)
  // Vamos usar window.location diretamente quando necessário

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);

      // Verificar se já temos dados no serviço
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Buscar dados atualizados da API
      const freshUser = await authService.fetchUserProfile();
      if (freshUser) {
        setUser(freshUser);
      } else if (!storedUser) {
        // Não temos usuário armazenado e não conseguimos buscar
        setUser(null);
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Configurar intervalo para refresh automático do token
  useEffect(() => {
    if (!user) return;

    // Refresh a cada 1h50m (antes do token de 2h expirar)
    const refreshInterval = setInterval(async () => {
      const refreshed = await authService.refreshAccessToken();
      if (!refreshed) {
        setUser(null);
      }
    }, 110 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    if (response.success && response.data) {
      setUser(response.data.user);
      console.log('Usuário definido no contexto:', response.data.user);
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    // Redirecionar para a página inicial após logout (forçar recarregamento completo)
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const switchUser = async () => {
    await authService.switchUser();
    setUser(null);
  };

  const refreshTokens = async () => {
    return await authService.refreshAccessToken();
  };

  const getAccessToken = () => {
    return authService.getAccessToken();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    switchUser,
    refreshTokens,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
