'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS        = ['/login', '/'];
const NO_PROJECT_REQUIRED = ['/login', '/', '/dashboard', '/home'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { projetoAtual, apiNav, isLoadingSpec } = useProject();
  const pathname = usePathname();
  const router   = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isPublic         = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  const noProjectNeeded  = NO_PROJECT_REQUIRED.some(p => pathname === p || pathname.startsWith(p + '/'));

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, isPublic, router]);

  // Redireciona para home se autenticado mas sem projeto selecionado
  useEffect(() => {
    if (!isLoading && isAuthenticated && !projetoAtual && !noProjectNeeded) {
      router.replace('/home');
    }
  }, [isAuthenticated, isLoading, projetoAtual, noProjectNeeded, router]);

  // Página pública (login): sem sidebar/header
  if (isPublic) {
    return <>{children}</>;
  }

  // Carregando sessão
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Não autenticado: aguarda redirect
  if (!isAuthenticated) return null;

  // Dashboard: sem sidebar de docs, layout simples
  if (noProjectNeeded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  // Docs: layout completo com sidebar dinâmica
  return (
    <div className="flex min-h-screen">
      <Sidebar
        apiNav={apiNav}
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-10 lg:p-12 max-w-5xl mx-auto w-full">
          {isLoadingSpec ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-3 text-slate-400">Carregando documentação...</span>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}
