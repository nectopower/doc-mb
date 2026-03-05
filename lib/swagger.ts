import { Code2, Zap, Layout, Database, Lock, Settings, Users, MessageSquare, Calendar, FileText, Bell, Star } from 'lucide-react';

export async function getSwaggerSpec() {
  // No servidor-side, verificar se podemos fazer fetch
  // Se não for possível, retornar null silenciosamente
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';

    // Adicionar timeout curto para não travar o build/dev
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos

    const res = await fetch(`${apiUrl}/docs-json`, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    // Silenciosamente retornar null sem logar erros
    // Isso é esperado em desenvolvimento quando o backend não está rodando
    return null;
  }
}

// Map tags to icon names
const ICON_MAP: Record<string, string> = {
  'Autenticação': 'Lock',
  'Agendamentos': 'Calendar',
  'Agendamentos Coletivos': 'Calendar',
  'Ações de Agendamento': 'Calendar',
  'Empresas': 'Layout',
  'Colaboradores': 'Users',
  'Serviços': 'Settings',
  'Avaliações': 'Star',
  'Avaliacoes': 'Star',
  'Notificações': 'Bell',
  'Relatórios': 'FileText',
  'WhatsApp': 'MessageSquare',
  'CRM': 'Users',
  'Produtos': 'Settings',
  'Pedidos': 'FileText',
  'Combos': 'Settings',
  'Templates': 'FileText',
  'Lista de Espera': 'Calendar',
  'Microsite': 'Layout',
  'CheckIns': 'Calendar',
  'Check-in': 'Calendar',
  'Bloqueios Agenda': 'Lock',
  'Comissões Detalhadas': 'FileText',
  'Faturamento': 'FileText',
  'Métricas e Dashboards': 'Layout',
  'Diagnóstico': 'Settings',
  'default': 'Code2'
};

// Helper to create safe slugs
function toSlug(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function processSpecToNav(spec: any, userType?: string | null) {
  if (!spec || !spec.paths) return [];

  const tags: Record<string, any[]> = {};
  
  // Importar função de permissões
  const { isEndpointAllowed } = require('./endpoint-permissions');
  
  Object.entries(spec.paths).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, operation]: [string, any]) => {
      // Ignore non-http methods
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) return;

      const tag = operation.tags?.[0] || 'Outros';
      
      // Filtrar por permissão do usuário
      if (userType && !isEndpointAllowed(userType as any, tag, path)) {
        return; // Pular endpoint não permitido
      }
      
      if (!tags[tag]) {
        tags[tag] = [];
      }

      const slugTag = toSlug(tag);
      const slugOpId = operation.operationId || toSlug(`${method}-${path}`);

      tags[tag].push({
        title: operation.summary || path,
        href: `/reference/${slugTag}/${slugOpId}`,
        method: method.toUpperCase(),
        path: path
      });
    });
  });

  return Object.entries(tags).map(([tag, items]) => ({
    title: tag,
    iconName: ICON_MAP[tag] || ICON_MAP['default'],
    items: items
  }));
}

export function getOperation(spec: any, tagParam: string, operationIdParam: string) {
  if (!spec || !spec.paths) return null;

  let foundOperation: any = null;
  let foundPath = '';
  let foundMethod = '';
  let foundTag = '';

  // Decode params just in case
  const decodedTag = decodeURIComponent(tagParam);
  const decodedOpId = decodeURIComponent(operationIdParam);

  Object.entries(spec.paths).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, operation]: [string, any]) => {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) return;

      const tag = operation.tags?.[0] || 'Outros';
      const slugTag = toSlug(tag);
      const slugOpId = operation.operationId || toSlug(`${method}-${path}`);

      // Match against slugified version
      if (slugTag === decodedTag && slugOpId === decodedOpId) {
        foundOperation = operation;
        foundPath = path;
        foundMethod = method;
        foundTag = tag;
      }
    });
  });

  if (foundOperation) {
    return {
      ...foundOperation,
      path: foundPath,
      method: foundMethod,
      tag: foundTag
    };
  }

  return null;
}

export function generateExampleFromSchema(schema: any): any {
  if (!schema) return null;

  // If example is provided directly
  if (schema.example !== undefined) return schema.example;

  // Handle allOf (merge schemas)
  if (schema.allOf) {
    let merged: any = {};
    schema.allOf.forEach((subSchema: any) => {
      const subExample = generateExampleFromSchema(subSchema);
      if (typeof subExample === 'object' && subExample !== null) {
        merged = { ...merged, ...subExample };
      }
    });
    return merged;
  }

  // Handle oneOf/anyOf (take first)
  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateExampleFromSchema(schema.oneOf[0]);
  }
  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateExampleFromSchema(schema.anyOf[0]);
  }

  // Handle various types
  switch (schema.type) {
    case 'object':
      if (schema.properties) {
        const obj: Record<string, any> = {};
        Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
          obj[key] = generateExampleFromSchema(prop);
        });
        return obj;
      }
      return {};
    
    case 'array':
      if (schema.items) {
        return [generateExampleFromSchema(schema.items)];
      }
      return [];
    
    case 'string':
      if (schema.format === 'email') return 'user@example.com';
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'date') return new Date().toISOString().split('T')[0];
      if (schema.format === 'uuid') return '123e4567-e89b-12d3-a456-426614174000';
      if (schema.enum && schema.enum.length > 0) return schema.enum[0];
      return 'string_value';
    
    case 'integer':
    case 'number':
      return 0;
    
    case 'boolean':
      return true;
      
    default:
      return null;
  }
}
