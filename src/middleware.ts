
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

  // Get hostname from request headers
  // The 'x-forwarded-host' header is used by Vercel and other platforms
  const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host');

  // If the hostname is missing, do nothing
  if (!hostname) {
    return NextResponse.next();
  }
  
  // Define your main application domain.
  const rootDomain = 'delvify.delvind.com';

  // Normalize hostname (remove port for local development)
  const currentHost = hostname.replace(`:${url.port}`, '');

  // If the request is for the main domain or localhost, let it pass.
  if (currentHost === rootDomain || currentHost === 'localhost') {
    return NextResponse.next();
  }

  // For any other domain, rewrite the path to include the hostname.
  // This allows you to handle multi-tenancy based on the path.
  // e.g., a request to `tenant1.com/dashboard` will be rewritten to `/tenant1.com/dashboard`
  const rewriteUrl = new URL(`/${hostname}${url.pathname}`, req.url);
  return NextResponse.rewrite(rewriteUrl);
}
