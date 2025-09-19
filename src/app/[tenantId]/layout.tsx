
import type {Metadata} from 'next';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { hexToHsl } from '@/lib/utils';
import { ThemeInjector } from './theme-injector';

export async function generateMetadata({ params }: { params: { tenantId: string } }): Promise<Metadata> {
  const settings = await getGlobalSettingsForTenant(params.tenantId);
  return {
    title: settings.footerInfo.copyrightText ? settings.footerInfo.copyrightText.replace('{YEAR}', new Date().getFullYear().toString()) : 'DelviFy',
    description: 'A plataforma completa para criação de cursos e gerenciamento de inquilinos',
  };
}


export default async function TenantLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { tenantId: string };
}>) {
  
  const settings = await getGlobalSettingsForTenant(params.tenantId);
  const primaryColorHsl = hexToHsl(settings.primaryColor);

  return (
    <>
      <ThemeInjector primaryColorHsl={primaryColorHsl} />
      {children}
    </>
  );
}
