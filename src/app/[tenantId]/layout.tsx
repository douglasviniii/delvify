
import type {Metadata} from 'next';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { hexToHsl } from '@/lib/utils';
import { ThemeInjector } from './theme-injector';


export async function generateMetadata({ params }: { params: { tenantId: string } }): Promise<Metadata> {
  const settings = await getGlobalSettingsForTenant(params.tenantId);
  const siteName = settings.footerInfo.copyrightText ? settings.footerInfo.copyrightText.replace(/© \d{4} | LTDA./g, '').trim() : 'DelviFy';

  return {
    title: `${siteName} | Venda cursos e estude online`,
    description: 'DelviFy: A plataforma da Delvind para criar seu estúdio, vender cursos e infoprodutos. Seja um vendedor ou aluno, use a DelviFy.',
    openGraph: {
      title: `${siteName} | Venda cursos e estude online`,
      description: 'DelviFy: A plataforma da Delvind para criar seu estúdio, vender cursos e infoprodutos.',
      url: settings.footerInfo.cnpjLink,
      siteName: siteName,
      images: [
        {
          url: 'https://darkgreen-lark-741030.hostingersite.com/img/capa11.png',
          width: 1200,
          height: 630,
          alt: 'Plataforma DelviFy para venda de cursos online',
        },
      ],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} | Venda cursos e estude online`,
      description: 'DelviFy: A plataforma da Delvind para criar seu estúdio, vender cursos e infoprodutos.',
      images: ['https://darkgreen-lark-741030.hostingersite.com/img/capa11.png'],
    },
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
