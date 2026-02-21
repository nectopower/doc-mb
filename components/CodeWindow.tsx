'use client'

import { Check, Copy, Terminal } from 'lucide-react'
import { useState } from 'react'

interface CodeWindowProps {
  title?: string
  language?: string
  code: string
  className?: string
}

export default function CodeWindow({ title = 'Exemplo', language = 'bash', code, className = '' }: CodeWindowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1117] text-slate-900 dark:text-slate-300 ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#16181D]">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-400">
          <Terminal className="w-3.5 h-3.5" />
          <span className="uppercase">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          title="Copiar código"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar bg-white dark:bg-[#0F1117]">
        <pre className="font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-300 bg-transparent">
          <code className={`language-${language} text-slate-900 dark:text-slate-300`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
