/**
 * Cliente HTTP com suporte a autenticação automática
 * Inclui JWT nos headers e trata refresh token automaticamente
 */

import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  skipAuthRefresh?: boolean;
}

/**
 * Cliente API com tratamento automático de autenticação
 */
class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Adiciona um callback para esperar o refresh do token
   */
  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notifica todos os subscribers que o token foi atualizado
   */
  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Faz uma requisição HTTP com tratamento automático de autenticação
   */
  async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
      skipAuthRefresh = false,
    } = options;

    // Headers padrão
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Adicionar token de autenticação se necessário
    if (requiresAuth) {
      const token = authService.getAccessToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: defaultHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      // Se a resposta for 401 e não estamos em processo de refresh
      if (response.status === 401 && requiresAuth && !skipAuthRefresh) {
        // Se já estamos fazendo refresh, aguardar
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.addRefreshSubscriber((token: string) => {
              // Tentar novamente com o novo token
              this.request<T>(endpoint, { ...options, skipAuthRefresh: true })
                .then(resolve)
                .catch(reject);
            });
          });
        }

        // Iniciar refresh do token
        this.isRefreshing = true;
        try {
          const refreshed = await authService.refreshAccessToken();
          this.isRefreshing = false;

          if (refreshed) {
            // Notificar todos os subscribers
            const newToken = authService.getAccessToken();
            if (newToken) {
              this.onRefreshed(newToken);
            }

            // Tentar novamente com o novo token
            return await this.request<T>(endpoint, { ...options, skipAuthRefresh: true });
          } else {
            // Refresh falhou, limpar sessão
            await authService.logout();
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          }
        } catch (error) {
          this.isRefreshing = false;
          throw error;
        }
      }

      // Verificar se a resposta foi bem sucedida
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao fazer requisição');
    }
  }

  /**
   * Requisição GET
   */
  get<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Requisição POST
   */
  post<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * Requisição PUT
   */
  put<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * Requisição DELETE
   */
  delete<T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Requisição PATCH
   */
  patch<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }
}

// Instância singleton do cliente
export const api = new ApiClient();

/**
 * Hook para usar o cliente API
 */
export function useApi() {
  return {
    get: api.get.bind(api),
    post: api.post.bind(api),
    put: api.put.bind(api),
    delete: api.delete.bind(api),
    patch: api.patch.bind(api),
  };
}
