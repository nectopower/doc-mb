/**
 * Mapeamento de permissões de endpoints por tipo de usuário
 * Define quais tags/endpoints cada tipo de usuário pode acessar
 */

export type UserType = 'admin' | 'company' | 'collaborator' | 'client';

/**
 * Mapeamento de tags permitidas por tipo de usuário
 */
export const ENDPOINT_PERMISSIONS: Record<UserType, string[]> = {
  // Admin - Acesso total
  admin: ['*'],

  // Empresa - Acesso às consultas
  company: [
    'Autenticação',
    'Pessoa Física',
    'Pessoa Jurídica',
    'Busca',
  ],

  // Colaborador - Acesso às consultas
  collaborator: [
    'Autenticação',
    'Pessoa Física',
    'Pessoa Jurídica',
    'Busca',
  ],

  // Cliente - Acesso às consultas
  client: [
    'Autenticação',
    'Pessoa Física',
    'Pessoa Jurídica',
    'Busca',
  ],
};


/**
 * Verifica se um endpoint é permitido para um tipo de usuário
 */
export function isEndpointAllowed(
  userType: UserType | null | undefined,
  tag: string,
  path?: string
): boolean {
  // Se não há usuário logado, apenas autenticação é permitida
  if (!userType) {
    return tag === 'Autenticação';
  }

  // Admin tem acesso total
  if (userType === 'admin') {
    return true;
  }

  // Verificar se a tag está permitida
  const allowedTags = ENDPOINT_PERMISSIONS[userType] || [];

  // Wildcard — acesso total
  if (allowedTags.includes('*')) return true;

  return allowedTags.includes(tag);
}

/**
 * Filtra endpoints baseado no tipo de usuário
 */
export function filterEndpointsByUserType(
  endpoints: Array<{ tag: string; path?: string; [key: string]: any }>,
  userType: UserType | null | undefined
): Array<{ tag: string; path?: string; [key: string]: any }> {
  if (!userType || userType === 'admin') {
    return endpoints; // Admin vê tudo
  }

  return endpoints.filter(endpoint => 
    isEndpointAllowed(userType, endpoint.tag, endpoint.path)
  );
}

/**
 * Decodifica o token JWT para obter o userType
 */
export function getUserTypeFromToken(token: string | null): UserType | null {
  if (!token) return null;

  try {
    // JWT tem formato: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decodificar payload (base64)
    // Adicionar padding se necessário
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const payload = JSON.parse(atob(base64));
    
    // Retornar userType ou role
    return (payload.userType || payload.role || null) as UserType | null;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}
