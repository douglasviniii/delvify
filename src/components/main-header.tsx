
'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { Instagram, Facebook, Linkedin, Youtube, MessageCircle } from 'lucide-react';
import type { GlobalSettings } from '@/lib/settings';

const socialIcons: { [key: string]: React.ReactNode } = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
};

// Este é o ID principal do inquilino para o site público.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

// Componente de link com hover state
const HoverLink = ({ href, children, color, hoverColor }: { href: string; children: React.ReactNode; color: string; hoverColor: string }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <Link 
      href={href}
      style={{ color: isHovered ? hoverColor : color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  )
}

// O cabeçalho precisa ser um client component para usar o hook useState no HoverLink.
// No entanto, não podemos usar `await` em client components.
// Solução: buscar os dados no componente pai (layout ou página) e passar como props,
// ou usar um client component que faz o fetch em um useEffect.
// Para manter a simplicidade e a renderização do servidor, vamos usar uma abordagem mista:
// O componente principal será async, e um subcomponente será 'use client'.

export async function MainHeader() {
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);

  return <ClientHeader settings={settings} />;
}

// Client Component para lidar com interatividade
function ClientHeader({ settings }: { settings: GlobalSettings }) {
  const navItems = [
    { id: 'courses', label: 'Cursos', href: '/courses' },
    { id: 'blog', label: 'Blog', href: '/blog' },
    { id: 'faq', label: 'FAQ', href: '/faq' },
    { id: 'about', label: 'Quem Somos', href: '/about' },
  ];

  const visibleNavItems = navItems.filter(item => settings.pageVisibility[item.id] ?? true);

  const socialLinksToShow = Object.entries(settings.socialLinks)
    .filter(([, details]) => details.enabled && details.url)
    .map(([key, details]) => ({
      name: key,
      url: details.url,
      icon: socialIcons[key],
    }));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="ml-10 hidden gap-6 md:flex">
          {visibleNavItems.map((item) => (
            <HoverLink
              key={item.label}
              href={item.href}
              color={settings.colors.navbarLinkColor}
              hoverColor={settings.colors.navbarLinkHoverColor}
            >
              {item.label}
            </HoverLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {settings.socialsLocation.showInHeader && socialLinksToShow.length > 0 && (
             <div className="hidden md:flex items-center gap-4">
                {socialLinksToShow.map(social => (
                  <Link key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      {social.icon}
                  </Link>
                ))}
             </div>
          )}
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
