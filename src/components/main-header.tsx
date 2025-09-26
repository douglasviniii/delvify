
import React from 'react';
import { ClientHeader } from './client-header';
import type { GlobalSettings } from '@/lib/types';


export function MainHeader({ settings }: { settings: GlobalSettings }) {
  return <ClientHeader settings={settings} />;
}
