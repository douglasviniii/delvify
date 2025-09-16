
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function middleware(req: NextRequest) {
  // A lógica de reescrita foi movida para ser tratada diretamente nas páginas do servidor (Server Components)
  // usando o cabeçalho 'host'. Isso simplifica o middleware e evita os erros 404 que estavam ocorrendo.
  return NextResponse.next();
}
