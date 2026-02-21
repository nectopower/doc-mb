'use client';

/**
 * Componente de Menu de Usuário
 * Mostra botão de login quando não autenticado
 * Mostra dropdown com opções quando autenticado
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { useRouter } from 'next/navigation';
import { User, LogOut, LogIn, ChevronDown, Loader2, FolderOpen, RefreshCw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout, switchUser } = useAuth();
  const { projetoAtual, limparProjeto } = useProject();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    // Redirecionar para a página inicial após logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleSwitchUser = async () => {
    setIsOpen(false);
    await switchUser();
    // switchUser já redireciona, mas garantir
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Estado de loading
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  // Não autenticado - mostrar botão de login
  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    );
  }

  // Autenticado - mostrar menu dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          {user?.name ? (
            <span className="text-primary font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
        <span className="hidden sm:inline max-w-[150px] truncate">
          {user?.name}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
          {/* Cabeçalho do Dropdown */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email}
            </p>
          </div>

          {/* Badge de Tipo */}
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
              {user?.userType === 'admin' && 'Administrador'}
              {user?.userType === 'company' && 'Empresa'}
              {user?.userType === 'collaborator' && 'Colaborador'}
              {user?.userType === 'client' && 'Cliente'}
            </span>
          </div>

          {/* Projeto atual */}
          {projetoAtual && (
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Projeto ativo</p>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {projetoAtual.nome}
              </p>
            </div>
          )}

          {/* Opções do Menu */}
          <div className="py-2">
            {/* Trocar projeto */}
            <button
              onClick={() => { setIsOpen(false); limparProjeto(); router.push('/home'); }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full text-left"
            >
              <RefreshCw className="w-4 h-4" />
              Trocar projeto
            </button>

            {/* Gerenciar projetos */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              Gerenciar projetos
            </Link>

            <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
              <button
                onClick={handleSwitchUser}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full text-left"
              >
                <LogIn className="w-4 h-4" />
                Trocar usuário
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
