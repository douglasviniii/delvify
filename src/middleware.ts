
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // A lógica de internacionalização foi removida.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Pular todas as rotas internas (API, _next) e arquivos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
