import { Construction } from 'lucide-react'

export default function WebhooksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fadeIn">
      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Construction className="w-10 h-10 text-slate-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">Webhooks</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          A funcionalidade de Webhooks está em desenvolvimento. Em breve você poderá receber notificações em tempo real sobre eventos do sistema.
        </p>
      </div>
    </div>
  )
}
