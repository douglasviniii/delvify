import React from 'react';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { ClientFooter } from './client-footer';

// Este é o ID principal do inquilino para o site público.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

// O componente principal será async (Server Component) para buscar os dados.
export async function MainFooterWrapper() {
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);
  return <ClientFooter settings={settings} />;
}
