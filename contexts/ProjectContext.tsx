'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { processSpecToNav } from '@/lib/swagger';
import { NavItem } from '@/components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
const STORAGE_KEY = 'serasa_projeto_atual';

export interface Projeto {
  id: number;
  nome: string;
  descricao: string | null;
  swagger_url: string;
  ativo: boolean;
}

interface ProjectContextType {
  projetos: Projeto[];
  projetoAtual: Projeto | null;
  apiNav: NavItem[];
  isLoadingSpec: boolean;
  isLoadingProjetos: boolean;
  selecionarProjeto: (projeto: Projeto) => Promise<void>;
  carregarProjetos: () => Promise<void>;
  limparProjeto: () => void;
  criarProjeto: (dados: Omit<Projeto, 'id' | 'ativo'>) => Promise<Projeto>;
  atualizarProjeto: (id: number, dados: Partial<Projeto>) => Promise<void>;
  removerProjeto: (id: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('api_access_token') || localStorage.getItem('accessToken') || '';
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projetos, setProjetos]               = useState<Projeto[]>([]);
  const [projetoAtual, setProjetoAtual]       = useState<Projeto | null>(null);
  const [apiNav, setApiNav]                   = useState<NavItem[]>([]);
  const [isLoadingSpec, setIsLoadingSpec]     = useState(false);
  const [isLoadingProjetos, setIsLoadingProjetos] = useState(false);

  const carregarSpec = async (projeto: Projeto) => {
    setIsLoadingSpec(true);
    try {
      // Usa proxy para evitar CORS ao buscar specs de domínios externos
      const proxyUrl = `/api/proxy-spec?url=${encodeURIComponent(projeto.swagger_url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Spec não encontrada');
      const spec = await res.json();
      setApiNav(processSpecToNav(spec));
    } catch (err) {
      console.error('Erro ao carregar spec:', err);
      setApiNav([]);
    } finally {
      setIsLoadingSpec(false);
    }
  };

  const carregarProjetos = async () => {
    setIsLoadingProjetos(true);
    try {
      const res = await fetch(`${API_URL}/projetos`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Falha');
      const data = await res.json();
      setProjetos(data.data || []);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
    } finally {
      setIsLoadingProjetos(false);
    }
  };

  const selecionarProjeto = async (projeto: Projeto) => {
    setProjetoAtual(projeto);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projeto));
    await carregarSpec(projeto);
  };

  const limparProjeto = () => {
    setProjetoAtual(null);
    setApiNav([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const criarProjeto = async (dados: Omit<Projeto, 'id' | 'ativo'>): Promise<Projeto> => {
    const res = await fetch(`${API_URL}/projetos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    await carregarProjetos();
    return data.data;
  };

  const atualizarProjeto = async (id: number, dados: Partial<Projeto>) => {
    const res = await fetch(`${API_URL}/projetos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(dados),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    await carregarProjetos();
    if (projetoAtual?.id === id) {
      const atualizado = { ...projetoAtual, ...dados };
      setProjetoAtual(atualizado);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado));
    }
  };

  const removerProjeto = async (id: number) => {
    const res = await fetch(`${API_URL}/projetos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    if (projetoAtual?.id === id) limparProjeto();
    await carregarProjetos();
  };

  // Restaurar projeto salvo no localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const projeto = JSON.parse(saved) as Projeto;
        setProjetoAtual(projeto);
        carregarSpec(projeto);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  return (
    <ProjectContext.Provider value={{
      projetos, projetoAtual, apiNav,
      isLoadingSpec, isLoadingProjetos,
      selecionarProjeto, carregarProjetos,
      limparProjeto, criarProjeto,
      atualizarProjeto, removerProjeto,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
