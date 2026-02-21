'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProject, Projeto } from '@/contexts/ProjectContext';
import {
  BookOpen, Plus, Pencil, Trash2, ExternalLink,
  Loader2, X, Check, AlertCircle,
  Users, FolderOpen, ShieldCheck, Building2, UserCheck, User,
  ToggleLeft, ToggleRight, KeyRound,
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────
interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'company' | 'collaborator' | 'client';
  ativo: boolean;
  telefone: string | null;
  criadoEm: string;
}

const TIPO_LABEL: Record<string, string> = {
  admin:        'Administrador',
  company:      'Empresa',
  collaborator: 'Colaborador',
  client:       'Cliente',
};

const TIPO_COLOR: Record<string, string> = {
  admin:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  company:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  collaborator: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  client:       'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('api_access_token') || localStorage.getItem('accessToken') || '';
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';

// ─── Aba Projetos ─────────────────────────────────────────────────
function TabProjetos() {
  const router = useRouter();
  const {
    projetos, projetoAtual, isLoadingProjetos,
    carregarProjetos, selecionarProjeto,
    criarProjeto, atualizarProjeto, removerProjeto,
  } = useProject();

  const [showForm, setShowForm]   = useState(false);
  const [editando, setEditando]   = useState<Projeto | null>(null);
  const [formNome, setFormNome]   = useState('');
  const [formDesc, setFormDesc]   = useState('');
  const [formUrl, setFormUrl]     = useState('');
  const [formError, setFormError] = useState('');
  const [salvando, setSalvando]   = useState(false);
  const [abrindo, setAbrindo]     = useState<number | null>(null);
  const [removendo, setRemovendo] = useState<number | null>(null);

  useEffect(() => { carregarProjetos(); }, []);

  const abrirFormNovo = () => {
    setEditando(null); setFormNome(''); setFormDesc(''); setFormUrl(''); setFormError(''); setShowForm(true);
  };
  const abrirFormEditar = (p: Projeto) => {
    setEditando(p); setFormNome(p.nome); setFormDesc(p.descricao || ''); setFormUrl(p.swagger_url); setFormError(''); setShowForm(true);
  };
  const fecharForm = () => { setShowForm(false); setEditando(null); setFormError(''); };

  const salvarProjeto = async () => {
    if (!formNome.trim() || !formUrl.trim()) { setFormError('Nome e URL são obrigatórios'); return; }
    setSalvando(true); setFormError('');
    try {
      if (editando) {
        await atualizarProjeto(editando.id, { nome: formNome, descricao: formDesc || null, swagger_url: formUrl });
      } else {
        await criarProjeto({ nome: formNome, descricao: formDesc || null, swagger_url: formUrl });
      }
      fecharForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  const handleAcessar = async (projeto: Projeto) => {
    setAbrindo(projeto.id);
    await selecionarProjeto(projeto);
    router.push('/reference');
  };

  const handleRemover = async (projeto: Projeto) => {
    if (!confirm(`Remover o projeto "${projeto.nome}"?`)) return;
    setRemovendo(projeto.id);
    try { await removerProjeto(projeto.id); } finally { setRemovendo(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Projetos</h2>
        <button
          onClick={abrirFormNovo}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo projeto
        </button>
      </div>

      {/* Projeto ativo */}
      {projetoAtual && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
          <BookOpen className="w-5 h-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary">Projeto aberto atualmente</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{projetoAtual.nome}</p>
          </div>
          <button
            onClick={() => router.push('/reference')}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver docs
          </button>
        </div>
      )}

      {isLoadingProjetos ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : projetos.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum projeto cadastrado</p>
          <p className="text-sm mt-1">Clique em "Novo projeto" para adicionar</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetos.map((projeto) => (
            <div
              key={projeto.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border transition-all ${
                projetoAtual?.id === projeto.id
                  ? 'border-primary shadow-sm shadow-primary/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">{projeto.nome}</h3>
                  {projetoAtual?.id === projeto.id && (
                    <span className="shrink-0 px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary rounded-full">Aberto</span>
                  )}
                </div>
                {projeto.descricao && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{projeto.descricao}</p>
                )}
                <p className="text-xs text-slate-400 truncate mb-4 font-mono">{projeto.swagger_url}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcessar(projeto)}
                    disabled={abrindo === projeto.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {abrindo === projeto.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                    Acessar
                  </button>
                  <button
                    onClick={() => abrirFormEditar(projeto)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemover(projeto)}
                    disabled={removendo === projeto.id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remover"
                  >
                    {removendo === projeto.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Projeto */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {editando ? 'Editar projeto' : 'Novo projeto'}
              </h3>
              <button onClick={fecharForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome <span className="text-red-500">*</span></label>
                <input value={formNome} onChange={e => setFormNome(e.target.value)} placeholder="Ex: Serasa API"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descrição opcional"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL do Swagger <span className="text-red-500">*</span></label>
                <input value={formUrl} onChange={e => setFormUrl(e.target.value)} placeholder="https://api.exemplo.com/swagger.json"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={fecharForm}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button onClick={salvarProjeto} disabled={salvando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editando ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Aba Usuários ─────────────────────────────────────────────────
function TabUsuarios({ meId }: { meId: number }) {
  const [usuarios, setUsuarios]   = useState<Usuario[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editando, setEditando]   = useState<Usuario | null>(null);
  const [formNome, setFormNome]   = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formTipo, setFormTipo]   = useState<string>('client');
  const [formTel, setFormTel]     = useState('');
  const [formError, setFormError] = useState('');
  const [salvando, setSalvando]   = useState(false);
  const [toggling, setToggling]   = useState<number | null>(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (res.ok) setUsuarios(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setEditando(null); setFormNome(''); setFormEmail(''); setFormSenha('');
    setFormTipo('client'); setFormTel(''); setFormError(''); setShowForm(true);
  };
  const abrirEditar = (u: Usuario) => {
    setEditando(u); setFormNome(u.nome); setFormEmail(u.email); setFormSenha('');
    setFormTipo(u.tipo); setFormTel(u.telefone || ''); setFormError(''); setShowForm(true);
  };
  const fechar = () => { setShowForm(false); setEditando(null); setFormError(''); };

  const salvar = async () => {
    if (!formNome.trim() || !formEmail.trim() || (!editando && !formSenha.trim())) {
      setFormError('Nome, email e senha são obrigatórios'); return;
    }
    setSalvando(true); setFormError('');
    try {
      const body: any = { nome: formNome, email: formEmail, tipo: formTipo, telefone: formTel || null };
      if (!editando || formSenha) body.senha = formSenha;
      if (editando) body.ativo = editando.ativo;

      const res = await fetch(`${API}/usuarios${editando ? `/${editando.id}` : ''}`, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fechar();
      carregar();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  const toggleStatus = async (u: Usuario) => {
    setToggling(u.id);
    try {
      const res = await fetch(`${API}/usuarios/${u.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ativo: !u.ativo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      carregar();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setToggling(null);
    }
  };

  const TipoIcon = ({ tipo }: { tipo: string }) => {
    if (tipo === 'admin')        return <ShieldCheck className="w-3.5 h-3.5" />;
    if (tipo === 'company')      return <Building2 className="w-3.5 h-3.5" />;
    if (tipo === 'collaborator') return <UserCheck className="w-3.5 h-3.5" />;
    return <User className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Usuários</h2>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo usuário
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum usuário cadastrado</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Tipo</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {usuarios.map((u) => (
                <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!u.ativo ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">{u.nome.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{u.nome}</span>
                      {u.id === meId && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded">você</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COLOR[u.tipo]}`}>
                      <TipoIcon tipo={u.tipo} />
                      {TIPO_LABEL[u.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(u)}
                      disabled={toggling === u.id || (u.id === meId && u.ativo)}
                      title={u.id === meId && u.ativo ? 'Não é possível desativar sua própria conta' : u.ativo ? 'Desativar' : 'Ativar'}
                      className="inline-flex items-center gap-1 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {toggling === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : u.ativo ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => abrirEditar(u)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Usuário */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {editando ? 'Editar usuário' : 'Novo usuário'}
              </h3>
              <button onClick={fechar} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome <span className="text-red-500">*</span></label>
                  <input value={formNome} onChange={e => setFormNome(e.target.value)} placeholder="Nome completo"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@exemplo.com"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {editando ? (
                      <span className="flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> Nova senha <span className="font-normal text-slate-400">(opcional)</span></span>
                    ) : (
                      <span>Senha <span className="text-red-500">*</span></span>
                    )}
                  </label>
                  <input type="password" value={formSenha} onChange={e => setFormSenha(e.target.value)} placeholder="Mín. 6 caracteres"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                  <input value={formTel} onChange={e => setFormTel(e.target.value)} placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo <span className="text-red-500">*</span></label>
                  <select value={formTipo} onChange={e => setFormTipo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="admin">Administrador</option>
                    <option value="company">Empresa</option>
                    <option value="collaborator">Colaborador</option>
                    <option value="client">Cliente</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={fechar}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editando ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'projetos' | 'usuarios'>('projetos');

  const isAdmin = user?.userType === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Olá, {user?.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gerencie projetos{isAdmin ? ' e usuários' : ''} da documentação
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setTab('projetos')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'projetos'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> Projetos
        </button>
        {isAdmin && (
          <button
            onClick={() => setTab('usuarios')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'usuarios'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" /> Usuários
          </button>
        )}
      </div>

      {/* Conteúdo */}
      {tab === 'projetos' && <TabProjetos />}
      {tab === 'usuarios' && isAdmin && <TabUsuarios meId={Number(user?.id)} />}
    </div>
  );
}
