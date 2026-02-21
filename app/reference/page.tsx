import { getSwaggerSpec, processSpecToNav } from '@/lib/swagger';
import { redirect } from 'next/navigation';

export default async function ReferenceIndex() {
  const spec = await getSwaggerSpec();
  
  if (!spec) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Erro</h1>
        <p className="mt-2 text-gray-600">Não foi possível carregar a especificação da API.</p>
      </div>
    );
  }

  const nav = processSpecToNav(spec);
  
  if (nav.length > 0 && nav[0].items.length > 0) {
    redirect(nav[0].items[0].href);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">API Reference</h1>
      <p className="mt-2 text-gray-600">Selecione um endpoint no menu lateral para ver os detalhes.</p>
    </div>
  );
}