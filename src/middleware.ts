
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Combine todos os caminhos exceto por:
     * 1. Caminhos que começam com /api (rotas de API)
     * 2. Caminhos que começam com /_next/static (arquivos estáticos)
     * 3. Caminhos que começam com /_next/image (otimização de imagem)
     * 4. Caminhos que terminam com /favicon.ico (ícone de favicon)
     * 5. Caminhos dentro de /admin (para evitar reescritas no painel de admin)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Extrai o hostname da requisição. Prioriza o 'x-forwarded-host' que é passado pelo proxy/infra.
  let hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'delvify.delvind.com';

  // Remove a porta em ambiente de desenvolvimento, se presente.
  if (hostname.includes(':')) {
    hostname = hostname.split(':')[0];
  }
  
  // Define o domínio principal da sua aplicação.
  const mainAppDomain = 'delvify.delvind.com';
  
  // Se a requisição for para o domínio principal ou localhost, não faz nada e permite que a requisição continue.
  if (hostname === mainAppDomain || hostname === 'localhost') {
    return NextResponse.next();
  }

  // Reescreve a URL: todos os outros domínios são tratados como inquilinos.
  const rewriteUrl = new URL(`/${hostname}${url.pathname}`, req.url);
  
  const response = NextResponse.rewrite(rewriteUrl);
  // Passa o hostname original para a aplicação poder identificá-lo.
  response.headers.set('x-forwarded-host', hostname);

  return response;
}
