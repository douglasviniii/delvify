
'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Linkedin, Youtube, MessageCircle, Menu } from 'lucide-react';
import type { GlobalSettings } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from './ui/separator';

const socialIcons: { [key: string]: React.ReactNode } = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
};

// Componente de link com hover state, definido fora do escopo de ClientHeader
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

export function ClientHeader({ settings }: { settings: GlobalSettings }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
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
        <Logo logoUrl={settings.logoUrl} />
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
        <div className="ml-auto flex items-center gap-2">
           {settings.socialsLocation.showInHeader && socialLinksToShow.length > 0 && (
             <div className="hidden md:flex items-center gap-4">
                {socialLinksToShow.map(social => (
                  <Link key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      {social.icon}
                  </Link>
                ))}
             </div>
          )}
          <Button asChild className="hidden md:flex">
            <Link href="/login">Login</Link>
          </Button>

           <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                 <SheetHeader className="p-4">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <Logo logoUrl={settings.logoUrl} />
                 </SheetHeader>
                 <nav className="flex-1 px-4 mt-4 space-y-2">
                    {visibleNavItems.map((item) => (
                        <SheetClose asChild key={item.label}>
                            <Link href={item.href} className="block rounded-lg py-2 px-3 text-lg font-medium hover:bg-accent transition-colors">
                                {item.label}
                            </Link>
                        </SheetClose>
                    ))}
                 </nav>
                 <div className="p-4 border-t mt-auto">
                    <SheetClose asChild>
                        <Button asChild className="w-full">
                           <Link href="/login">Login</Link>
                        </Button>
                    </SheetClose>
                     {settings.socialsLocation.showInHeader && socialLinksToShow.length > 0 && (
                        <div className="flex justify-center items-center gap-4 pt-4">
                            {socialLinksToShow.map(social => (
                            <Link key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                {social.icon}
                            </Link>
                            ))}
                        </div>
                    )}
                 </div>
              </SheetContent>
            </Sheet>

        </div>
      </div>
    </header>
  );
}
