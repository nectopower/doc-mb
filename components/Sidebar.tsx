'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Code2,
  ChevronRight,
  Home,
  Lock,
  Settings,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUserTypeFromToken, isEndpointAllowed } from '@/lib/endpoint-permissions'
import { authService } from '@/lib/auth'

export interface NavItem {
  title: string
  href?: string
  icon?: any
  iconName?: string
  items?: NavItem[]
  method?: string
}

const ICONS: Record<string, any> = {
  Home, BookOpen, Code2, Lock, Settings,
};

const defaultNavigation: NavItem[] = [
  {
    title: 'Início',
    href: '/getting-started',
    icon: Home
  },
  {
    title: 'Começando',
    icon: BookOpen,
    items: [
      { title: 'Introdução', href: '/getting-started' },
      { title: 'Autenticação', href: '/auth' },
      { title: 'Rate Limits', href: '/rate-limits' },
      { title: 'Erros', href: '/errors' },
    ]
  },
  {
    title: 'API Reference',
    icon: Code2,
    items: [] // Will be populated dynamically
  },
]

export default function Sidebar({ apiNav, isMobileOpen, onClose }: { apiNav?: NavItem[], isMobileOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Começando', 'API Reference'])
  const [navigation, setNavigation] = useState(defaultNavigation)
  const [userType, setUserType] = useState<string | null>(null)

  // Obter userType do token ou do usuário logado
  useEffect(() => {
    const token = authService.getAccessToken()
    const user = authService.getUser()
    
    // Tentar obter do token primeiro
    const typeFromToken = getUserTypeFromToken(token)
    
    // Se não conseguir do token, usar do user
    const finalUserType = typeFromToken || user?.userType || null
    setUserType(finalUserType)
  }, [])

  // Filtrar endpoints baseado no userType
  useEffect(() => {
    if (apiNav && apiNav.length > 0) {
      // Filtrar cada tag e seus itens
      const filteredNav = apiNav.map(tag => {
        // Admin vê tudo
        if (userType === 'admin') {
          return tag;
        }
        
        // Verificar se a tag é permitida
        if (userType && !isEndpointAllowed(userType as any, tag.title)) {
          return null // Tag não permitida
        }

        // Filtrar itens dentro da tag
        const filteredItems = tag.items?.filter(item => {
          if (!userType) {
            // Sem login, apenas autenticação
            return tag.title === 'Autenticação'
          }
          return isEndpointAllowed(userType as any, tag.title, item.path)
        }) || []

        // Retornar tag apenas se tiver itens permitidos
        if (filteredItems.length === 0 && tag.title !== 'Autenticação') {
          return null
        }

        return {
          ...tag,
          items: filteredItems
        }
      }).filter(Boolean) as NavItem[]

      setNavigation(prev => {
        const newNav = [...prev]
        const apiRefIndex = newNav.findIndex(item => item.title === 'API Reference')
        if (apiRefIndex !== -1) {
          newNav[apiRefIndex] = {
            ...newNav[apiRefIndex],
            items: filteredNav
          }
        }
        return newNav
      })
    }
  }, [apiNav, userType])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const navContent = (
    <div className="p-6">
      <Link href="/getting-started" className="flex items-center gap-2 mb-8" onClick={onClose}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg">API Docs</span>
      </Link>

      <nav className="space-y-1">
        {navigation.map((item) => (
          <NavItemComponent
            key={item.title}
            item={item}
            pathname={pathname}
            onToggle={toggleExpanded}
            expandedItems={expandedItems}
            onLinkClick={onClose}
          />
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          Links Úteis
        </div>
        <div className="space-y-1">
          <a
            href="https://github.com"
            target="_blank"
            className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="#"
            className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            Suporte
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-sidebar-bg overflow-y-auto hidden md:flex flex-col flex-shrink-0">
        {navContent}
      </aside>

      {/* Drawer mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          {/* Painel */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}

function NavItemComponent({
  item,
  pathname,
  expandedItems,
  onToggle,
  onLinkClick,
  level = 0
}: {
  item: NavItem
  pathname: string
  expandedItems: string[]
  onToggle: (title: string) => void
  onLinkClick?: () => void
  level?: number
}) {
  const Icon = item.icon || (item.iconName ? ICONS[item.iconName] : null)
  const isActive = pathname === item.href
  const hasChildren = item.items && item.items.length > 0
  const isExpanded = expandedItems.includes(item.title)

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => onToggle(item.title)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            level > 0 ? 'text-slate-600 dark:text-slate-400' : 'font-medium'
          }`}
          style={{ paddingLeft: level > 0 ? `${level * 12 + 12}px` : undefined }}
        >
          {Icon && <Icon className="w-4 h-4 text-slate-500" />}
          <span className="flex-1 text-left">{item.title}</span>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {item.items?.map((child, index) => (
              <NavItemComponent
                key={child.href || child.title || index}
                item={child}
                pathname={pathname}
                expandedItems={expandedItems}
                onToggle={onToggle}
                onLinkClick={onLinkClick}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href || '#'}
      onClick={onLinkClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
        isActive
          ? 'text-primary bg-primary/10 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
      style={{ paddingLeft: level > 0 ? `${level * 12 + 12}px` : undefined }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {item.method && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
          item.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          item.method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          item.method === 'PUT' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
          item.method === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {item.method}
        </span>
      )}
      <span className="truncate">{item.title}</span>
    </Link>
  )
}
