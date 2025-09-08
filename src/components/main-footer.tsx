'use client';

import { Logo } from '@/components/logo';
import { Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function MainFooter() {
  const quickLinks = [
    { label: 'Cursos', href: '/courses' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '#' },
    { label: 'Quem Somos', href: '#' },
    { label: 'Login', href: '/login' },
  ];

  const policies = [
    { label: 'Política de Privacidade', href: '#' },
    { label: 'Política de Cancelamento e Reembolso', href: '#' },
    { label: 'Termo de Uso', href: '#' },
    { label: 'Política de Cookies', href: '#' },
    { label: 'Política de Atendimento e Suporte', href: '#' },
    { label: 'Política de Direitos Autorais', href: '#' },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Soluções Inovadoras para um Mundo Digital.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><MessageCircle className="h-5 w-5" /></Link>
            </div>
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
              <p>Email: contato@delvind.com</p>
              <p>Suporte: suporte@delvind.com</p>
              <p>Telefone: 45 8800-0647</p>
              <p className="mt-4">CNPJ</p>
              <p>57.278.676/0001-69</p>
              <Link href="#" className="underline hover:text-primary">
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
