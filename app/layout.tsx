import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProviderWrapper } from '@/components/AuthProviderWrapper'
import { ProjectProviderWrapper } from '@/components/ProjectProviderWrapper'
import LayoutWrapper from '@/components/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'API Documentation - Serasa',
  description: 'Documentação completa da API Serasa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProviderWrapper>
            <ProjectProviderWrapper>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </ProjectProviderWrapper>
          </AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
