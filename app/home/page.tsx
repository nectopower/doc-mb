'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProject, Projeto } from '@/contexts/ProjectContext';
import {
  BookOpen, Plus, Search, ArrowRight, Loader2,
  FolderOpen, AlertCircle, ChevronLeft, ChevronRight,
  CheckCircle2, X, GraduationCap, Code2,
} from 'lucide-react';
import Link from 'next/link';

const PER_PAGE = 9;

export default function HomePage() {
  const router = useRouter();
  const {
    projetos, projetoAtual, isLoadingProjetos, isLoadingSpec,
    carregarProjetos, selecionarProjeto, criarProjeto,
  } = useProject();

  const [busca, setBusca]       = useState('');
  const [pagina, setPagina]     = useState(1);
  const [selecionando, setSelecionando] = useState<number | null>(null);

  // Form novo projeto
  const [showForm, setShowForm] = useState(false);
  const [fNome, setFNome]       = useState('');
  const [fDesc, setFDesc]       = useState('');
  const [fUrl, setFUrl]         = useState('');
  const [fErro, setFErro]       = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { carregarProjetos(); }, []);
  useEffect(() => { setPagina(1); }, [busca]);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return projetos;
    const q = busca.toLowerCase();
    return projetos.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      (p.descricao || '').toLowerCase().includes(q)
    );
  }, [projetos, busca]);

  const totalPaginas = Math.ceil(filtrados.length / PER_PAGE);
  const paginados    = filtrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  // Seleciona o projeto (carrega spec) mas não navega ainda
  const handleSelecionar = async (projeto: Projeto) => {
    if (projetoAtual?.id === projeto.id) return; // já selecionado
    setSelecionando(projeto.id);
    await selecionarProjeto(projeto);
    setSelecionando(null);
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fecharForm = () => { setShowForm(false); setFNome(''); setFDesc(''); setFUrl(''); setFErro(''); };

  const handleCriar = async () => {
    if (!fNome.trim() || !fUrl.trim()) { setFErro('Nome e URL são obrigatórios'); return; }
    setSalvando(true); setFErro('');
    try {
      await criarProjeto({ nome: fNome.trim(), descricao: fDesc.trim() || null, swagger_url: fUrl.trim() });
      fecharForm();
    } catch (err: any) {
      setFErro(err.message || 'Erro ao criar projeto');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Painel do projeto selecionado (aparece quando há projeto ativo) ── */}
      {projetoAtual && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide mb-0.5">
                  Projeto selecionado
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {projetoAtual.nome}
                </h2>
                {projetoAtual.descricao && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    {projetoAtual.descricao}
                  </p>
                )}
              </div>
            </div>

            {isLoadingSpec && (
              <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0 mt-1" />
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/reference')}
              disabled={isLoadingSpec}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              Ver API Reference
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/getting-started"
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:border-primary hover:text-primary transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              Começar / Configurar
            </Link>
          </div>
        </div>
      )}

      {/* ── Cabeçalho da lista ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {projetoAtual ? 'Todos os projetos' : 'Meus projetos'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isLoadingProjetos
              ? 'Carregando...'
              : `${projetos.length} projeto${projetos.length !== 1 ? 's' : ''} cadastrado${projetos.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo projeto
        </button>
      </div>

      {/* ── Busca ── */}
      {projetos.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Lista ── */}
      {isLoadingProjetos ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>

      ) : projetos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Nenhum projeto cadastrado</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Cadastre a URL do seu Swagger para começar
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Cadastrar primeiro projeto
          </button>
        </div>

      ) : filtrados.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          Nenhum projeto encontrado para{' '}
          <span className="font-medium text-slate-600 dark:text-slate-300">"{busca}"</span>
        </div>

      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginados.map((projeto) => {
              const isAtivo     = projetoAtual?.id === projeto.id;
              const isSelecionando = selecionando === projeto.id;

              return (
                <button
                  key={projeto.id}
                  onClick={() => handleSelecionar(projeto)}
                  disabled={isSelecionando || isAtivo}
                  className={`relative flex flex-col text-left bg-white dark:bg-slate-800 rounded-xl border transition-all w-full p-5 group ${
                    isAtivo
                      ? 'border-primary shadow-sm shadow-primary/10 cursor-default'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md cursor-pointer'
                  } disabled:opacity-70`}
                >
                  {/* Badge ativo */}
                  {isAtivo && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Selecionado
                    </span>
                  )}

                  <div className="flex items-start gap-3 pr-20">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isAtivo ? 'bg-primary' : 'bg-primary/10 group-hover:bg-primary/20'
                    }`}>
                      <BookOpen className={`w-4 h-4 ${isAtivo ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                        {projeto.nome}
                      </h3>
                      {projeto.descricao && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {projeto.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Indicador de loading / ação */}
                  <div className={`mt-4 flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    isAtivo ? 'text-primary' : 'text-slate-400 group-hover:text-primary'
                  }`}>
                    {isSelecionando ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Carregando...</>
                    ) : isAtivo ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Projeto ativo</>
                    ) : (
                      <>Clique para selecionar <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {(pagina - 1) * PER_PAGE + 1}–{Math.min(pagina * PER_PAGE, filtrados.length)} de {filtrados.length} projetos
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPagina(p)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      p === pagina
                        ? 'bg-primary text-white font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal novo projeto ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Novo projeto</h3>
              <button onClick={fecharForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {fErro && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {fErro}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome <span className="text-red-500">*</span></label>
                <input value={fNome} onChange={e => setFNome(e.target.value)} placeholder="Ex: Minha API de Pagamentos"
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição <span className="text-slate-400 font-normal">(opcional)</span></label>
                <input value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Descrição breve"
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL do Swagger <span className="text-red-500">*</span></label>
                <input value={fUrl} onChange={e => setFUrl(e.target.value)} placeholder="https://sua-api.com/swagger.json"
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent" />
                <p className="text-xs text-slate-400 mt-1">Suporta .json ou .yaml</p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={fecharForm}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button onClick={handleCriar} disabled={salvando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {salvando ? 'Criando...' : 'Criar projeto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
