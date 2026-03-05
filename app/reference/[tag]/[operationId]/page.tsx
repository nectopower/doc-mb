import { getSwaggerSpec, getOperation, generateExampleFromSchema } from '@/lib/swagger';
import { notFound } from 'next/navigation';
import TryItConsole from '@/components/TryItConsole';
import CodeWindow from '@/components/CodeWindow';
import { generateCurlCommand } from '@/lib/curl-generator';
import EndpointGuard from '@/components/EndpointGuard';

export const dynamic = 'force-dynamic';

export default async function OperationPage({
  params
}: {
  params: { tag: string; operationId: string }
}) {
  const spec = await getSwaggerSpec();
  
  if (!spec) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Erro</h1>
        <p className="mt-2 text-gray-600">Não foi possível carregar a especificação da API.</p>
      </div>
    );
  }

  const operation = getOperation(spec, params.tag, params.operationId);

  if (!operation) {
    notFound();
  }

  // Verificar permissão será feita no cliente via EndpointGuard

  // Generate Example Data for Curl and Body
  const requestSchema = operation.requestBody?.content?.['application/json']?.schema;
  const requestExample = requestSchema ? generateExampleFromSchema(requestSchema) : undefined;

  // Generate Curl Command
  const curlCommand = generateCurlCommand(
    operation.method, 
    operation.path, 
    operation.parameters?.filter((p: any) => p.in === 'header') || [],
    requestExample
  );

  // Get first success response example
  const successResponse = operation.responses?.['200'] || operation.responses?.['201'] || Object.values(operation.responses || {})[0];
  const responseSchema = successResponse?.content?.['application/json']?.schema;
  const responseExampleData = responseSchema ? generateExampleFromSchema(responseSchema) : {};
  const responseExample = JSON.stringify(responseExampleData, null, 2);

  // Obter tag original da operação
  const operationTag = (operation as any).tag || operation.tags?.[0] || 'Outros';

  return (
    <EndpointGuard tag={operationTag} path={operation.path}>
      <div className="max-w-[1600px] mx-auto pb-20 px-4 lg:px-8">
      <div className="grid lg:grid-cols-5 gap-12">
        {/* Left Column: Documentation Content */}
        <div className="lg:col-span-3 space-y-12 pt-8">
          
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100">{operation.summary || 'Sem título'}</h1>
            
            <div className="flex items-center gap-4 text-sm font-mono mb-6">
              <span className={`px-3 py-1 rounded-md font-bold uppercase tracking-wide ${
                operation.method === 'get' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                operation.method === 'post' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                operation.method === 'put' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400' :
                operation.method === 'delete' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {operation.method}
              </span>
              <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api'}{operation.path}
              </span>
            </div>

            {operation.description && (
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {operation.description}
              </p>
            )}
          </div>

          {/* Parameters */}
          {operation.parameters && operation.parameters.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Parâmetros
              </h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
                {operation.parameters.map((param: any, index: number) => (
                  <div key={index} className="p-4 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{param.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {param.in}
                        </span>
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
                          {param.schema?.type || 'string'}
                        </span>
                        {param.required && (
                          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    {param.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {param.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body Info (Schema Table) */}
          {operation.requestBody && (
            <div>
              <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">Body Schema</h3>
               <p className="text-slate-600 dark:text-slate-400 mb-4">
                 Envie os dados no formato <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm">application/json</code>.
               </p>
              {/* Note: In a full implementation, we would parse the schema properties here into a table. 
                  For now, we rely on the right column example. */}
            </div>
          )}
          
          {/* Try It Console (Inline Mode) */}
           <div>
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">Playground</h3>
            <TryItConsole 
              method={operation.method}
              path={operation.path}
              parameters={operation.parameters}
              requestBody={operation.requestBody}
            />
          </div>

        </div>

        {/* Right Column: Sticky Examples */}
        <div className="lg:col-span-2 space-y-8 pt-8 lg:sticky lg:top-8 h-fit">
          <div className="space-y-6">
            <CodeWindow 
              title="Request Example" 
              language="bash" 
              code={curlCommand} 
            />
            
            <CodeWindow 
              title="Response Example" 
              language="json" 
              code={responseExample} 
            />
          </div>
        </div>

      </div>
    </div>
    </EndpointGuard>
  );
}
