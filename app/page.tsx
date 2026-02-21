import Link from 'next/link';
import {
  BookOpen, Code2, Shield, Zap, Users, Link2,
  ArrowRight, CheckCircle, FileJson, Eye, Play,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            API Docs
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Zap className="w-3.5 h-3.5" />
          Documentação centralizada
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
          Todas as suas APIs
          <span className="block text-primary mt-2">em um só lugar</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Conecte qualquer API que possua arquivo Swagger ou OpenAPI e ofereça à sua equipe
          uma documentação interativa, organizada e pronta para uso — sem configuração manual.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
          >
            Acessar plataforma
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── O que o sistema faz ─────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">O que a plataforma faz com sua documentação</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Você fornece a URL do arquivo Swagger. Nós fazemos o resto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FileJson className="w-5 h-5 text-primary" />,
                title: 'Importa automaticamente',
                desc: 'A plataforma lê o arquivo swagger.json ou swagger.yaml diretamente da URL informada e extrai todos os endpoints, parâmetros, schemas e exemplos.',
              },
              {
                icon: <Eye className="w-5 h-5 text-primary" />,
                title: 'Organiza por categorias',
                desc: 'Os endpoints são agrupados pelas tags definidas na especificação. A navegação lateral é gerada automaticamente, sem nenhuma configuração extra.',
              },
              {
                icon: <Play className="w-5 h-5 text-primary" />,
                title: 'Permite testar em tempo real',
                desc: 'Cada endpoint possui um console "Try it out" onde o usuário preenche os parâmetros e executa a requisição diretamente da interface, vendo a resposta em tempo real.',
              },
              {
                icon: <Shield className="w-5 h-5 text-primary" />,
                title: 'Gerencia autenticação JWT',
                desc: 'O token JWT é capturado automaticamente após o login e aplicado em todas as requisições autenticadas — sem precisar copiar e colar o token manualmente.',
              },
              {
                icon: <Code2 className="w-5 h-5 text-primary" />,
                title: 'Exibe exemplos de código',
                desc: 'Para cada endpoint, a plataforma gera exemplos prontos de request e response em formato JSON, facilitando a integração pelos desenvolvedores.',
              },
              {
                icon: <Link2 className="w-5 h-5 text-primary" />,
                title: 'Atualiza sob demanda',
                desc: 'Sempre que o arquivo Swagger da API for atualizado, basta recarregar o projeto na plataforma. Nenhuma edição manual é necessária.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-slate-800 bg-slate-900 space-y-3 hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">Como funciona</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Acesso por convite. O administrador controla quem entra.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              icon: <Users className="w-5 h-5 text-primary" />,
              title: 'Admin cadastra usuários',
              desc: 'Não há auto-cadastro público. O administrador cria as contas e define o nível de acesso de cada membro da equipe.',
            },
            {
              step: '02',
              icon: <Link2 className="w-5 h-5 text-primary" />,
              title: 'Projetos são cadastrados',
              desc: 'O admin adiciona projetos informando o nome e a URL do arquivo Swagger da API. Pode ser ambiente de desenvolvimento ou produção.',
            },
            {
              step: '03',
              icon: <BookOpen className="w-5 h-5 text-primary" />,
              title: 'Usuários fazem login',
              desc: 'Com as credenciais fornecidas pelo admin, os membros da equipe acessam a plataforma e visualizam os projetos disponíveis.',
            },
            {
              step: '04',
              icon: <Play className="w-5 h-5 text-primary" />,
              title: 'Documentação ao vivo',
              desc: 'Ao abrir um projeto, todos os endpoints são carregados automaticamente. Qualquer membro pode explorar, testar e integrar.',
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="relative space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-slate-800">{step}</span>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {icon}
                </div>
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefícios ──────────────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                Chega de documentação espalhada
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Quando uma equipe cresce, as APIs se multiplicam. Cada projeto tem seu próprio Swagger em um endpoint diferente,
                às vezes sem autenticação, às vezes fora do ar. A plataforma resolve isso centralizando tudo em um único ponto de acesso seguro e consistente.
              </p>
              <ul className="space-y-3">
                {[
                  'Um login para acessar todas as APIs da equipe',
                  'Endpoints sempre organizados e navegáveis',
                  'Teste de requisições sem sair da documentação',
                  'Acesso controlado pelo administrador',
                  'Compatível com qualquer API que siga o padrão OpenAPI 3.0',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-4 font-mono text-sm">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-2">swagger.json</span>
              </div>
              <div className="text-slate-400">
                <span className="text-blue-400">"openapi"</span>
                <span className="text-white">: </span>
                <span className="text-green-400">"3.0.0"</span>
                <span className="text-white">,</span>
              </div>
              <div className="text-slate-400 pl-4">
                <span className="text-blue-400">"paths"</span>
                <span className="text-white">: {'{'}</span>
              </div>
              <div className="text-slate-400 pl-8">
                <span className="text-yellow-400">"/consulta/pf"</span>
                <span className="text-white">: {'{'}</span>
              </div>
              <div className="text-slate-400 pl-12">
                <span className="text-purple-400">"get"</span>
                <span className="text-white">: </span>
                <span className="text-slate-500">{'{ ... }'}</span>
              </div>
              <div className="text-primary text-xs mt-4 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                Importado e renderizado automaticamente
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center space-y-6">
        <h2 className="text-4xl font-bold">Pronto para centralizar suas APIs?</h2>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Acesse a plataforma com as credenciais fornecidas pelo administrador da sua equipe.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors text-lg"
        >
          Entrar na plataforma
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-medium text-slate-400">API Docs</span>
          </div>
          <span>Documentação centralizada para equipes de desenvolvimento</span>
        </div>
      </footer>

    </div>
  );
}
