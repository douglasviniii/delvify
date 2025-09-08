import React from 'react';
import { ClientHeader } from './client-header';
import type { GlobalSettings } from '@/lib/settings';


// O componente principal agora é um componente simples que recebe as configurações
// e as repassa para o componente de cliente.
export function MainHeader({ settings }: { settings: GlobalSettings }) {
  return <ClientHeader settings={settings} />;
}
