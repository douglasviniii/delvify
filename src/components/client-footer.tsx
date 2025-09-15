
'use client';

import * as React from 'react';
import { Logo } from '@/components/logo';
import { Instagram, Facebook, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { GlobalSettings } from '@/lib/types';

const socialIcons: { [key: string]: React.ReactNode } = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
};

// Componente de link com hover state - precisa ser um client component
const HoverLink = ({ href, children, color, hoverColor }: { href: string; children: React.ReactNode; color: string; hoverColor: string }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    return (
      <Link 
        href={href}
        style={{ color: isHovered ? hoverColor : color }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="text-base transition-colors"
      >
        {children}
      </Link>
    )
}

export function ClientFooter({ settings }: { settings: GlobalSettings }) {
  const [copyrightText, setCopyrightText] = React.useState(settings.footerInfo.copyrightText);

  React.useEffect(() => {
    setCopyrightText(
      settings.footerInfo.copyrightText.replace('{YEAR}', new Date().getFullYear().toString())
    );
  }, [settings.footerInfo.copyrightText]);
    
  const allLinks = [
    { id: 'courses', label: 'Cursos', href: '/courses' },
    { id: 'blog', label: 'Blog', href: '/blog' },
    { id: 'faq', label: 'FAQ', href: '/faq' },
    { id: 'about', label: 'Quem Somos', href: '/about' },
    { id: 'verify', label: 'Verificar Certificado', href: '/verify' },
    { id: 'login', label: 'Login', href: '/login' },
    { id: 'signup', label: 'Cadastre-se', href: '/signup' },
  ];

  const allPolicies = [
    { id: 'privacy-policy', label: 'Política de Privacidade', href: '/privacy-policy' },
    { id: 'refund-policy', label: 'Política de Cancelamento e Reembolso', href: '/refund-policy' },
    { id: 'terms-of-use', label: 'Termo de Uso', href: '/terms-of-use' },
    { id: 'cookie-policy', label: 'Política de Cookies', href: '/cookie-policy' },
    { id: 'support-policy', label: 'Política de Atendimento e Suporte', href: '/support-policy' },
    { id: 'copyright-policy', label: 'Política de Direitos Autorais', href: '/copyright-policy' },
  ];
  
  const socialLinksToShow = Object.entries(settings.socialLinks)
    .filter(([, details]) => details.enabled && details.url)
    .map(([key, details]) => ({
      name: key,
      url: details.url,
      icon: socialIcons[key],
    }));

  const visibleLinks = allLinks.filter(link => settings.pageVisibility[link.id] ?? true);
  const visiblePolicies = allPolicies.filter(policy => settings.pageVisibility[policy.id] ?? true);

  return (
    <footer className="border-t bg-background">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-6">
            <Logo logoUrl={settings.logoUrl}/>
            <p className="text-base text-muted-foreground">
              Soluções Inovadoras para um Mundo Digital.
            </p>
            {settings.socialsLocation.showInFooter && socialLinksToShow.length > 0 && (
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
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              {visibleLinks.map((link) => (
                <li key={link.label}>
                  <HoverLink href={link.href} color={settings.colors.footerLinkColor} hoverColor={settings.colors.footerLinkHoverColor}>{link.label}</HoverLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Políticas</h3>
            <ul className="space-y-3">
              {visiblePolicies.map((link) => (
                <li key={link.label}>
                  <HoverLink href={link.href} color={settings.colors.footerLinkColor} hoverColor={settings.colors.footerLinkHoverColor}>{link.label}</HoverLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <div className="space-y-3 text-base text-muted-foreground">
              <p>Email: {settings.footerInfo.email}</p>
              <p>Telefone: {settings.footerInfo.phone}</p>
              <p className="mt-4 font-medium text-foreground">CNPJ</p>
              <p>{settings.footerInfo.cnpj}</p>
               <HoverLink href={settings.footerInfo.cnpjLink} color={settings.colors.footerLinkColor} hoverColor={settings.colors.footerLinkHoverColor}>
                Consultar na Receita Federal
              </HoverLink>
            </div>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-base text-muted-foreground">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
}
