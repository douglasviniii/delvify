
import React from 'react';
import { ClientFooter } from './client-footer';
import type { GlobalSettings } from '@/lib/types';


export async function MainFooterWrapper({ settings }: { settings: GlobalSettings }) {
  return <ClientFooter settings={settings} />;
}
