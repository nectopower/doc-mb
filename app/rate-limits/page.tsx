import { AlertTriangle, Clock, Shield } from 'lucide-react'

export default function RateLimitsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-bold mb-4">Rate Limits</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Para garantir a estabilidade e disponibilidade da API para todos os usuários, aplicamos limites de taxa nas requisições.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Limite Padrão</h3>
          </div>
          <div className="text-3xl font-bold mb-2">1000</div>
          <p className="text-slate-600 dark:text-slate-400">requisições por 15 minutos por IP</p>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Proteção DDoS</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Monitoramos tráfego anômalo e podemos bloquear temporariamente IPs que excedam significativamente os limites ou apresentem comportamento malicioso.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Headers de Rate Limit</h2>
        <p className="text-slate-600 dark:text-slate-400">
          As respostas da API incluem headers que informam seu status atual de consumo:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-semibold">Header</th>
                <th className="py-3 px-4 font-semibold">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-4 font-mono text-sm text-primary">X-RateLimit-Limit</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">O número máximo de requisições permitidas no período.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-sm text-primary">X-RateLimit-Remaining</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">O número de requisições restantes no período atual.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-sm text-primary">X-RateLimit-Reset</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Timestamp Unix de quando o limite será resetado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Excedeu o limite?</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Se você exceder o limite, receberá uma resposta com status <code>429 Too Many Requests</code>.
            Aguarde o tempo indicado no header <code>Retry-After</code> antes de fazer novas requisições.
          </p>
        </div>
      </div>
    </div>
  )
}
