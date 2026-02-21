export function generateCurlCommand(method: string, path: string, headers: any[] = [], body?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
  let cmd = `curl --request ${method.toUpperCase()} \\\n`;
  cmd += `  --url ${baseUrl}${path} \\\n`;

  // Add default headers
  cmd += `  --header 'Content-Type: application/json' \\\n`;
  
  // Add auth placeholder if needed (assuming most endpoints need it)
  if (!path.includes('/auth/login') && !path.includes('/public')) {
    cmd += `  --header 'Authorization: Bearer <token>' \\\n`;
  }

  // Add custom headers from spec
  headers.forEach(h => {
    cmd += `  --header '${h.name}: ${h.example || '<value>'}' \\\n`;
  });

  // Add Body
  if (body) {
    const bodyContent = body.content?.['application/json']?.schema?.example || 
                       body.content?.['application/json']?.schema || {};
    
    // Remove readOnly fields if possible, or just dump the example
    cmd += `  --data '${JSON.stringify(bodyContent, null, 2)}'`;
  }

  return cmd;
}
