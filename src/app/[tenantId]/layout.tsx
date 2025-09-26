
import type {Metadata} from 'next';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { hexToHsl } from '@/lib/utils';
import { ThemeInjector } from './theme-injector';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';


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
    <html lang="pt-BR" style={{'--primary-hsl': primaryColorHsl} as React.CSSProperties}>
      <body>
        <ThemeInjector primaryColorHsl={primaryColorHsl} />
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader settings={settings} />
            <main className="flex-1">{children}</main>
            <MainFooter settings={settings} />
        </div>
      </body>
    </html>
  );
}
