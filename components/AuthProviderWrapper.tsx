'use client';

/**
 * Wrapper para o AuthProvider
 * Este componente marca o AuthProvider como cliente para evitar erros de hidratação
 */

import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface AuthProviderWrapperProps {
  children: ReactNode;
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
