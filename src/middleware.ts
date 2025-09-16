
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
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || 'delvify.delvind.com';

  const rootDomain = 'delvify.delvind.com';
  
  // Normalize hostname for local development
  const currentHost = hostname.split(':')[0];

  // If it's the root domain or localhost, do nothing
  if (currentHost === rootDomain || currentHost === 'localhost') {
    return NextResponse.next();
  }

  // For any other domain (tenant domain), rewrite the path
  // e.g., a request to `tenant1.com/dashboard` is rewritten to `/tenant1.com/dashboard`
  return NextResponse.rewrite(
    new URL(`/${currentHost}${url.pathname}${url.search}`, req.url)
  );
}
