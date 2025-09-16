
import React from 'react';
import { ClientHeader } from './client-header';
import { getGlobalSettingsForTenant } from '@/lib/settings';

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

// O componente principal agora é um Server Component assíncrono
// que busca os dados e os passa para o Client Component.
export async function MainHeader() {
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);
  return <ClientHeader settings={settings} tenantId={MAIN_TENANT_ID} />;
}
