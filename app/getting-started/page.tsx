'use client'

import { useState, useEffect } from 'react'
import { Shield, Zap, Code2, Link2, Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useProject } from '@/contexts/ProjectContext'

export default function GettingStartedPage() {
  const { projetoAtual, atualizarProjeto, selecionarProjeto } = useProject()

  const [nome, setNome]           = useState('')
  const [descricao, setDescricao] = useState('')
  const [swaggerUrl, setSwaggerUrl] = useState('')

  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Preenche os campos quando o projeto carrega (pode vir do localStorage com delay)
  useEffect(() => {
    if (projetoAtual) {
      setNome(projetoAtual.nome || '')
      setDescricao(projetoAtual.descricao || '')
      setSwaggerUrl(projetoAtual.swagger_url || '')
    }
  }, [projetoAtual?.id])

  const handleSave = async () => {
    if (!projetoAtual || !nome.trim() || !swaggerUrl.trim()) return
    setSaving(true)
    setErrorMsg('')
    setSaved(false)
    try {
      await atualizarProjeto(projetoAtual.id, {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        swagger_url: swaggerUrl.trim(),
        ativo: projetoAtual.ativo,
      })
      // Recarregar a spec somente se a URL mudou
      if (swaggerUrl.trim() !== projetoAtual.swagger_url) {
        await selecionarProjeto({ ...projetoAtual, nome: nome.trim(), swagger_url: swaggerUrl.trim() })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const isDirty =
    projetoAtual &&
    (nome !== projetoAtual.nome ||
      descricao !== (projetoAtual.descricao || '') ||
      swaggerUrl !== projetoAtual.swagger_url)

  return (
    <div className="space-y-12 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-bold mb-4">Começando</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Tudo que você precisa saber para começar a usar a API em minutos.
        </p>
      </div>

      {/* Pré-requisitos */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Pré-requisitos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard number="1" icon={Link2}   title="URL Base do Backend"   description="Informe a URL base da sua API (desenvolvimento ou produção) para configurar as requisições." />
          <StepCard number="2" icon={Shield}  title="Obter Token via Login"  description="Faça uma requisição ao endpoint de login para receber seu token JWT de acesso." />
          <StepCard number="3" icon={Zap}     title="Fazer Primeira Request" description="Use o token obtido para autenticar e testar qualquer endpoint disponível na documentação." />
        </div>
      </section>

      {/* Configuração do projeto */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Configuração do Projeto</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Edite os dados do projeto ativo. Para adicionar um novo projeto, use o{' '}
          <Link href="/dashboard" className="text-primary hover:underline font-medium">Dashboard</Link>.
        </p>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-card space-y-5">
          {projetoAtual ? (
            <>
              {/* Aviso de contexto */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
                <span className="font-semibold">Editando:</span>
                <span>{projetoAtual.nome}</span>
              </div>
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nome da API
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => { setNome(e.target.value); setSaved(false) }}
                  placeholder="Ex: Minha API de Pagamentos"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Descrição <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={descricao}
                  onChange={e => { setDescricao(e.target.value); setSaved(false) }}
                  placeholder="Descreva brevemente o que esta API faz..."
                  rows={3}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* URL Base */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  URL do Swagger / OpenAPI
                </label>
                <input
                  type="text"
                  value={swaggerUrl}
                  onChange={e => { setSwaggerUrl(e.target.value); setSaved(false) }}
                  placeholder="https://sua-api.com/swagger.json"
                  className="w-full px-4 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-slate-400">
                  URL do arquivo swagger.json ou swagger.yaml. Usada para carregar os endpoints na documentação.
                </p>
              </div>

              {/* Erro */}
              {errorMsg && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Botão */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !nome.trim() || !swaggerUrl.trim() || !isDirty}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
                  {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Atualizar projeto'}
                </button>
                {saved && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Projeto atualizado com sucesso.
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
              Nenhum projeto selecionado.{' '}
              <Link href="/home" className="text-primary hover:underline">
                Selecione um projeto
              </Link>{' '}
              para editar suas configurações aqui.
            </div>
          )}
        </div>
      </section>

      {/* Códigos de Status */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Códigos de Status HTTP</h2>
        <div className="space-y-3">
          <StatusRow code="200" title="OK"                    description="Requisição bem-sucedida"              type="success" />
          <StatusRow code="201" title="Created"               description="Recurso criado com sucesso"           type="success" />
          <StatusRow code="400" title="Bad Request"           description="Parâmetros inválidos na requisição"   type="error" />
          <StatusRow code="401" title="Unauthorized"          description="Token ausente ou inválido"            type="error" />
          <StatusRow code="403" title="Forbidden"             description="Sem permissão para acessar o recurso" type="error" />
          <StatusRow code="404" title="Not Found"             description="Recurso não encontrado"               type="error" />
          <StatusRow code="429" title="Too Many Requests"     description="Rate limit excedido"                  type="error" />
          <StatusRow code="500" title="Internal Server Error" description="Erro interno do servidor"             type="error" />
        </div>
      </section>

      {/* Próximos Passos */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Próximos Passos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/auth" className="group p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary bg-card transition-all hover:shadow-lg">
            <Shield className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Autenticação</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Aprenda sobre login, refresh tokens e como manter a sessão ativa.
            </p>
          </Link>
          <Link href="/reference" className="group p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary bg-card transition-all hover:shadow-lg">
            <Code2 className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">API Reference</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Explore todos os endpoints disponíveis e seus parâmetros.
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}

function StepCard({ number, icon: Icon, title, description }: any) {
  return (
    <div className="relative p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-card">
      <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <Icon className="w-8 h-8 text-primary mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  )
}

function StatusRow({ code, title, description, type }: any) {
  const isSuccess = type === 'success'
  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border ${
      isSuccess
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
    }`}>
      <span className={`font-bold text-lg flex-shrink-0 ${
        isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {code}
      </span>
      <div className="flex-1">
        <div className={`font-semibold mb-1 ${
          isSuccess ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
        }`}>
          {title}
        </div>
        <div className={`text-sm ${
          isSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
        }`}>
          {description}
        </div>
      </div>
    </div>
  )
}
