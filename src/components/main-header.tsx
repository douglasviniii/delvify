
import React from 'react';
import { ClientHeader } from './client-header';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { headers } from 'next/headers';

// This component remains a Server Component to determine the tenantId on the server.
export async function MainHeader() {
  const headersList = headers();
  // The middleware adds this header. We read it here to know which tenant to render.
  const tenantId = headersList.get('x-tenant-id') || process.env.NEXT_PUBLIC_MAIN_TENANT_ID || 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';
  
  const settings = await getGlobalSettingsForTenant(tenantId);
  return <ClientHeader settings={settings} tenantId={tenantId} />;
}
