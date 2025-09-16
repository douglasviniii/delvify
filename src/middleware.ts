
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

  // Extrai o hostname da requisição (ex: 'cursosdojoao.com', 'app.delvify.com').
  const hostname = req.headers.get('host') || 'app.delvify.com';

  // Define o domínio principal da sua aplicação.
  // Em produção, isso deve ser o seu domínio real, ex: 'delvify.com'.
  const mainAppDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:9002';
  
  // Limpa o hostname para remover a porta em ambiente de desenvolvimento
  const currentHost = hostname.replace(`:${url.port}`, '');

  // Se a requisição for para o domínio principal, não faz nada e permite que a requisição continue.
  if (currentHost === mainAppDomain) {
    return NextResponse.next();
  }

  // Reescreve a URL: todos os outros domínios são tratados como subdomínios/inquilinos.
  // Por exemplo, uma requisição para 'cursosdojoao.com/sobre' é reescrita para
  // 'app.delvify.com/cursosdojoao.com/sobre'.
  // O cabeçalho 'x-forwarded-host' é usado para passar o hostname original para a aplicação.
  const rewriteUrl = new URL(`/${currentHost}${url.pathname}`, req.url);
  
  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set('x-forwarded-host', hostname);

  return response;
}
