/**
 * Serviço de Autenticação
 * Gerencia login, logout, tokens e sessão do usuário
 */

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      userType: 'admin' | 'company' | 'collaborator' | 'client';
      active: boolean;
      phone?: string;
      createdAt: string;
      updatedAt: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  userType: 'admin' | 'company' | 'collaborator' | 'client';
  active: boolean;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'api_access_token',
  REFRESH_TOKEN: 'api_refresh_token',
  USER_DATA: 'api_user_data',
};

/**
 * Serviço de Autenticação
 */
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private userData: UserProfile | null = null;

  constructor() {
    // Carregar dados do localStorage ao inicializar (apenas no browser)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userDataStr) {
        try {
          this.userData = JSON.parse(userDataStr);
        } catch {
          this.userData = null;
        }
      }
    }
  }

  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante para cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Falha ao realizar login');
    }

    const data: AuthResponse = await response.json();

    if (data.success && data.data) {
      this.setSession(data.data.user, data.data.tokens);
    }

    return data;
  }

  /**
   * Define a sessão do usuário
   */
  private setSession(user: UserProfile, tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.userData = user;

    // Salvar no localStorage (apenas no browser)
    if (typeof window !== 'undefined') {
      // Salvar nas chaves específicas do authService
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      // Salvar também em múltiplas chaves para compatibilidade com TryItConsole e aplicação principal
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('api_token', tokens.accessToken);
      localStorage.setItem('api_access_token', tokens.accessToken);
      localStorage.setItem('auth_token', tokens.accessToken);
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      localStorage.setItem('api_refresh_token', tokens.refreshToken);
      
      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('tokenUpdated', { 
        detail: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } 
      }));
    }
  }

  /**
   * Retorna o token de acesso atual
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Retorna o token de refresh atual
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Retorna os dados do usuário logado
   */
  getUser(): UserProfile | null {
    return this.userData;
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.userData;
  }

  /**
   * Atualiza o token de acesso usando o refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/atualizar-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar token');
      }

      const data = await response.json();

      if (data.success && data.data) {
        const newTokens: AuthTokens = {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          expiresIn: data.data.expiresIn,
        };

        // Atualizar tokens mantendo os dados do usuário
        if (this.userData) {
          this.setSession(this.userData, newTokens);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Busca os dados do usuário logado
   */
  async fetchUserProfile(): Promise<UserProfile | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/perfil`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // Se o token expirou, tentar atualizar
        if (response.status === 401) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Tentar novamente com o novo token
            return this.fetchUserProfile();
          }
        }
        throw new Error('Falha ao buscar perfil');
      }

      const data = await response.json();

      if (data.success && data.data?.user) {
        this.userData = data.data.user;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));
        }
        return data.data.user;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }

  /**
   * Realiza logout do usuário
   */
  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${API_URL}/auth/sair`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Limpa a sessão do usuário
   */
  private clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.userData = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  /**
   * Troca para outro usuário (logout e redireciona para login)
   */
  async switchUser(): Promise<void> {
    await this.logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

// Instância singleton do serviço
export const authService = new AuthService();

/**
 * Hook para usar o serviço de autenticação
 */
export function useAuth() {
  return {
    login: (credentials: LoginRequest) => authService.login(credentials),
    logout: () => authService.logout(),
    switchUser: () => authService.switchUser(),
    refreshTokens: () => authService.refreshAccessToken(),
    user: authService.getUser(),
    isAuthenticated: authService.isAuthenticated(),
    getAccessToken: () => authService.getAccessToken(),
  };
}
