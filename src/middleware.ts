
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
  // A lógica de reescrita de multi-inquilino foi temporariamente desativada
  // para corrigir um erro 404 generalizado.
  // TODO: Reimplementar a lógica multi-inquilino de forma robusta,
  // possivelmente lendo o hostname nas páginas do servidor em vez de reescrever a URL.
  return NextResponse.next();
}
