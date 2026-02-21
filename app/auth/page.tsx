import CodeBlock from '@/components/CodeBlock'
import { Lock, Key, ShieldCheck } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-bold mb-4">Autenticação</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          A API utiliza autenticação baseada em tokens JWT (JSON Web Tokens).
        </p>
      </div>

      <section className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Segurança em Primeiro Lugar</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Todas as requisições à API devem ser feitas via HTTPS. Requisições HTTP não seguras serão redirecionadas ou rejeitadas.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Key className="w-6 h-6 text-primary" />
          Obtendo um Token
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Para acessar recursos protegidos, você precisa primeiro obter um token de acesso fazendo login.
        </p>
        
        <CodeBlock
          language="bash"
          code={`curl -X POST ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api'}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "email@example.com",
    "senha": "suasenha123"
  }'`}
        />

        <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Resposta do Token</h3>
          <CodeBlock
            language="json"
            code={`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNj...",
    "user": {
      "id": 1,
      "email": "email@example.com",
      "nome": "Admin User",
      "role": "admin"
    }
  }
}`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lock className="w-6 h-6 text-primary" />
          Usando o Token
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Inclua o token no header <code>Authorization</code> de todas as suas requisições subsequentes.
        </p>
        
        <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Formato do Header</div>
            <code className="block p-3 bg-slate-100 dark:bg-slate-900 rounded-lg font-mono text-primary">
              Authorization: Bearer &lt;seu_token&gt;
            </code>
          </div>
        </div>

        <CodeBlock
          language="bash"
          code={`curl -X GET ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api'}/users/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`}
        />
      </section>
    </div>
  )
}
