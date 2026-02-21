import CodeBlock from '@/components/CodeBlock'
import { AlertCircle, FileWarning, ServerCrash } from 'lucide-react'

export default function ErrorsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-bold mb-4">Tratamento de Erros</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          A API utiliza códigos de status HTTP convencionais para indicar o sucesso ou falha de uma requisição.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Formato de Erro</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Quando ocorre um erro, o corpo da resposta conterá um objeto JSON com detalhes sobre o problema.
        </p>
        
        <CodeBlock
          language="json"
          code={`{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos.",
    "details": [
      "Email é obrigatório",
      "Senha deve ter no mínimo 6 caracteres"
    ]
  }
}`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Códigos de Status</h2>
        
        <div className="space-y-4">
          <ErrorCard 
            code={400} 
            title="Bad Request" 
            description="A requisição foi mal formada ou contém dados inválidos."
          />
          <ErrorCard 
            code={401} 
            title="Unauthorized" 
            description="Token de autenticação ausente, inválido ou expirado."
          />
          <ErrorCard 
            code={403} 
            title="Forbidden" 
            description="Você não tem permissão para acessar este recurso."
          />
          <ErrorCard 
            code={404} 
            title="Not Found" 
            description="O recurso solicitado não foi encontrado."
          />
          <ErrorCard 
            code={429} 
            title="Too Many Requests" 
            description="Você excedeu o limite de requisições da API."
          />
          <ErrorCard 
            code={500} 
            title="Internal Server Error" 
            description="Ocorreu um erro inesperado no servidor."
          />
        </div>
      </section>
    </div>
  )
}

function ErrorCard({ code, title, description }: { code: number, title: string, description: string }) {
  const isServer = code >= 500
  const colorClass = isServer 
    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
    : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400"

  return (
    <div className={`p-4 rounded-lg border flex gap-4 ${colorClass}`}>
      <div className="flex-shrink-0 font-bold text-xl w-12">{code}</div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </div>
  )
}
