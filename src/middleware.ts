
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// This is your main tenant ID, which will be used for your primary domain.
const MAIN_TENANT_ID = process.env.NEXT_PUBLIC_MAIN_TENANT_ID || 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

// The primary domain of your application.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'delvify.com';

// Cache to store domain-to-tenant mappings to reduce Firestore reads.
const tenantCache = new Map<string, string>();

async function getTenantIdForHost(host: string): Promise<string> {
  // If host is the root domain (or a subdomain like www), use the main tenant ID.
  if (host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`)) {
    return MAIN_TENANT_ID;
  }

  // Check cache first
  if (tenantCache.has(host)) {
    return tenantCache.get(host)!;
  }

  // If not in cache, query Firestore
  try {
    const adminDb = getAdminDb();
    const tenantsRef = adminDb.collection('tenants');
    const snapshot = await tenantsRef.where('customDomain', '==', host).limit(1).get();

    if (snapshot.empty) {
      // If no tenant is found for the custom domain, fall back to the main tenant.
      // In a production scenario, you might want to show a "not found" page.
      return MAIN_TENANT_ID;
    }

    const tenantId = snapshot.docs[0].id;
    // Store in cache for future requests
    tenantCache.set(host, tenantId);
    return tenantId;
  } catch (error) {
    console.error(`[Middleware] Error fetching tenant for host ${host}:`, error);
    // Fallback to main tenant on error
    return MAIN_TENANT_ID;
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const headers = new Headers(request.headers);

  // Prevent the middleware from running on internal Next.js paths, API routes, and static files.
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.') // Assumes static files have an extension
  ) {
    return NextResponse.next();
  }

  // Get the hostname from the request.
  const host = request.headers.get('host') || ROOT_DOMAIN;
  
  // Get the tenant ID based on the hostname.
  const tenantId = await getTenantIdForHost(host);
  const pathname = url.pathname;
  
  // Add the tenant ID to the request headers for use in Server Components.
  headers.set('x-tenant-id', tenantId);

  // If the request is for the root and we are on a custom domain, 
  // rewrite to the tenant's homepage.
  if (pathname === '/') {
    url.pathname = `/${tenantId}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }
  
  // Avoid rewriting for admin, login, signup, and student panel pages
  // These pages are not tenant-specific in the same way.
  const nonTenantRoutes = ['/admin', '/login', '/signup', '/student', '/verify'];
  if (nonTenantRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next({ request: { headers } });
  }

  // Check if the first segment of the path is already a tenant ID format (to avoid loops).
  // This regex checks for a 28-character alphanumeric string, typical for Firebase UIDs.
  const tenantIdRegex = /^\/([a-zA-Z0-9]{28})(?:\/|$)/;
  if (tenantIdRegex.test(pathname)) {
    // Even if the path already has a tenantId, we pass the resolved one in the header
    return NextResponse.next({ request: { headers } });
  }

  // Rewrite the path to include the tenant ID.
  // e.g., /about -> /<tenantId>/about
  url.pathname = `/${tenantId}${pathname}`;
  
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: [
    // Match all request paths except for internal and static files.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
