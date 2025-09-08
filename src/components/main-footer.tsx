
import { Logo } from '@/components/logo';
import { Instagram, Facebook, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { getGlobalSettingsForTenant } from '@/lib/settings';

const socialIcons: { [key: string]: React.ReactNode } = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
};

// Este é o ID principal do inquilino para o site público.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export async function MainFooter() {
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);

  const quickLinks = [
    { label: 'Cursos', href: '/courses' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Quem Somos', href: '#' },
    { label: 'Login', href: '/login' },
    { label: 'Cadastre-se', href: '/signup' },
  ];

  const policies = [
    { label: 'Política de Privacidade', href: '#' },
    { label: 'Política de Cancelamento e Reembolso', href: '#' },
    { label: 'Termo de Uso', href: '#' },
    { label: 'Política de Cookies', href: '#' },
    { label: 'Política de Atendimento e Suporte', href: '#' },
    { label: 'Política de Direitos Autorais', href: '#' },
  ];
  
  const socialLinksToShow = Object.entries(settings.socialLinks)
    .filter(([, details]) => details.enabled && details.url)
    .map(([key, details]) => ({
      name: key,
      url: details.url,
      icon: socialIcons[key],
    }));

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Soluções Inovadoras para um Mundo Digital.
            </p>
            {socialLinksToShow.length > 0 && (
                <div className="flex space-x-4">
                    {socialLinksToShow.map(social => (
                        <Link key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            {social.icon}
                        </Link>
                    ))}
                </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Políticas</h3>
            <ul className="space-y-2">
              {policies.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: {settings.footerInfo.email}</p>
              <p>Telefone: {settings.footerInfo.phone}</p>
              <p className="mt-4">CNPJ</p>
              <p>{settings.footerInfo.cnpj}</p>
              <Link href={settings.footerInfo.cnpjLink} className="underline hover:text-primary" target="_blank" rel="noopener noreferrer">
                Consultar na Receita Federal
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DelviFy Tecnologia Da Informação LTDA.
        </div>
      </div>
    </footer>
  );
}
