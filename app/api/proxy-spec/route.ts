import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/proxy-spec?url=<encoded-url>
 * Busca a spec (swagger.json / swagger.yaml) no servidor para evitar CORS.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Parâmetro url é obrigatório' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json, application/yaml, text/yaml, */*' },
      // Evitar cache stale no servidor
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Spec retornou HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const text = await res.text();

    // Tentar retornar como JSON
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      // YAML ou outro formato — retorna texto puro para o cliente tentar processar
      return new NextResponse(text, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao buscar spec' }, { status: 500 });
  }
}
