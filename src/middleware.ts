
import { NextRequest, NextResponse } from 'next/server';

// Este é o seu ID de inquilino principal, que será usado para o seu domínio principal.
const MAIN_TENANT_ID = process.env.NEXT_PUBLIC_MAIN_TENANT_ID || 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

// O domínio principal da sua aplicação.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'delvify.com';

// ID do seu projeto Firebase, necessário para a URL da API REST.
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'venda-fcil-pdv';

// Cache para armazenar mapeamentos de domínio para inquilino para reduzir as chamadas de API.
const tenantCache = new Map<string, string>();

async function getTenantIdForHost(host: string): Promise<string> {
  // Se o host for o domínio raiz (ou um subdomínio como www), use o ID do inquilino principal.
  if (host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`)) {
    return MAIN_TENANT_ID;
  }

  // Verifique o cache primeiro
  if (tenantCache.has(host)) {
    return tenantCache.get(host)!;
  }

  // Se não estiver no cache, consulte a API REST do Firestore.
  // Esta abordagem é compatível com o Edge Runtime do Next.js.
  const firestoreApiUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
  
  const query = {
    structuredQuery: {
      from: [{ collectionId: 'tenants' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'customDomain' },
          op: 'EQUAL',
          value: { stringValue: host }
        }
      },
      limit: 1
    }
  };

  try {
    const response = await fetch(firestoreApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
      // Adicionamos um revalidate para o fetch para ter um cache no lado do Next.js
      next: { revalidate: 3600 } // Cache por 1 hora
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Middleware] Erro na API do Firestore: ${response.status}`, errorBody);
        return MAIN_TENANT_ID; // Fallback em caso de erro na API
    }
    
    const data = await response.json();

    // A resposta é um array de documentos. Se o primeiro documento (índice 0) não tiver um 'document', não há correspondência.
    if (!data[0] || !data[0].document) {
      // Se nenhum inquilino for encontrado para o domínio personalizado, faz fallback para o principal.
      // Em produção, você pode querer mostrar uma página "não encontrado".
      return MAIN_TENANT_ID;
    }

    const docPath = data[0].document.name as string;
    // O tenantId é o último segmento do caminho do documento.
    // Ex: projects/PROJECT_ID/databases/(default)/documents/tenants/TENANT_ID
    const tenantId = docPath.split('/').pop()!;
    
    // Armazene no cache para solicitações futuras
    tenantCache.set(host, tenantId);
    return tenantId;

  } catch (error) {
    console.error(`[Middleware] Exceção ao buscar inquilino para o host ${host}:`, error);
    // Fallback para o inquilino principal em caso de erro
    return MAIN_TENANT_ID;
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const headers = new Headers(request.headers);

  // Impede que o middleware seja executado em caminhos internos do Next.js, rotas de API e arquivos estáticos.
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.') // Assume que arquivos estáticos têm uma extensão
  ) {
    return NextResponse.next();
  }

  // Obtém o hostname da requisição.
  const host = request.headers.get('host') || ROOT_DOMAIN;
  
  // Obtém o ID do inquilino com base no hostname.
  const tenantId = await getTenantIdForHost(host);
  const pathname = url.pathname;
  
  // Adiciona o ID do inquilino aos cabeçalhos da requisição para uso em Server Components.
  headers.set('x-tenant-id', tenantId);

  // Se a requisição for para a raiz e estivermos em um domínio personalizado,
  // reescreve para a página inicial do inquilino.
  if (pathname === '/') {
    url.pathname = `/${tenantId}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }
  
  // Evita reescrever para o painel de administração, login, signup e painel de estudante
  // Essas páginas não são específicas do inquilino da mesma forma.
  const nonTenantRoutes = ['/admin', '/login', '/signup', '/student', '/verify'];
  if (nonTenantRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next({ request: { headers } });
  }

  // Verifica se o primeiro segmento do caminho já está em formato de ID de inquilino (para evitar loops).
  // Este regex verifica por uma string alfanumérica de 28 caracteres, típica de UIDs do Firebase.
  const tenantIdRegex = /^\/([a-zA-Z0-9]{28})(?:\/|$)/;
  if (tenantIdRegex.test(pathname)) {
    // Mesmo que o caminho já tenha um tenantId, passamos o resolvido no cabeçalho
    return NextResponse.next({ request: { headers } });
  }

  // Reescreve o caminho para incluir o ID do inquilino.
  // ex., /about -> /<tenantId>/about
  url.pathname = `/${tenantId}${pathname}`;
  
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: [
    // Corresponde a todos os caminhos de solicitação, exceto arquivos internos e estáticos.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
