
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { Instagram, Facebook, Linkedin, Youtube, MessageCircle } from 'lucide-react';

const socialIcons: { [key: string]: React.ReactNode } = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
};

// Este é o ID principal do inquilino para o site público.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export async function MainHeader() {
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);

  const navItems = [
    { label: 'Cursos', href: '/courses' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Quem Somos', href: '#' },
  ];

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
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {settings.socialsLocation === 'header-footer' && socialLinksToShow.length > 0 && (
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
