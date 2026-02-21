import { Code2, Terminal } from 'lucide-react'
import Link from 'next/link'

export default function SDKsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-bold mb-4">Bibliotecas e SDKs</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Acelere seu desenvolvimento com nossas bibliotecas oficiais e da comunidade.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SDKCard 
          language="Node.js"
          icon="JS"
          status="Em breve"
          description="Cliente oficial para Node.js e TypeScript com tipagem completa."
        />
        <SDKCard 
          language="Python"
          icon="PY"
          status="Planejado"
          description="Cliente Python para integração com scripts e automações."
        />
      </div>

      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <Terminal className="w-6 h-6 text-slate-600" />
          <h3 className="text-xl font-semibold">Geração via OpenAPI</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Como nossa API segue a especificação OpenAPI 3.0, você pode gerar clientes para qualquer linguagem usando ferramentas como o OpenAPI Generator.
        </p>
        <div className="flex gap-4">
          <Link 
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api'}/swagger.json`}
            target="_blank"
            className="text-primary hover:underline font-medium"
          >
            Baixar Spec JSON
          </Link>
          <Link 
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api'}/swagger.yaml`}
            target="_blank"
            className="text-primary hover:underline font-medium"
          >
            Baixar Spec YAML
          </Link>
        </div>
      </div>
    </div>
  )
}

function SDKCard({ language, icon, status, description }: any) {
  return (
    <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-card hover:border-primary transition-colors cursor-not-allowed opacity-75">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
          {icon}
        </div>
        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {status}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-2">{language}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
    </div>
  )
}
