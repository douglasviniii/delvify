'use client';
import {
  BookCopy,
  LayoutDashboard,
  Newspaper,
  Settings,
  LogOut,
  Building,
  GraduationCap,
  PanelTop,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/blog', label: 'Studio de Blog', icon: Newspaper },
  { href: '/admin/courses', label: 'Studio de Cursos', icon: BookCopy },
  { href: '#', label: 'Estudio de Site', icon: PanelTop },
  { href: '#', label: 'Empresas', icon: Building },
  { href: '/admin/users', label: 'Alunos', icon: GraduationCap },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logout bem-sucedido!',
        description: 'Você foi desconectado com segurança.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro de Logout',
        description: 'Não foi possível fazer logout. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2" />
          <div className="p-2">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://picsum.photos/32" alt="Admin" data-ai-hint="person face" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                   <div className="text-left">
                      <p className="text-sm font-medium">DelviFy Admin</p>
                      <p className="text-xs text-muted-foreground truncate">delvify@delvin.com</p>
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mb-2">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Faturamento</DropdownMenuItem>
                <DropdownMenuItem>Equipe</DropdownMenuItem>
                <DropdownMenuItem>Assinatura</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator className="my-2" />
          <SidebarMenu>
            <SidebarMenuItem>
               <Link href="/admin/settings">
                  <SidebarMenuButton isActive={pathname === '/admin/settings'}>
                    <Settings />
                    <span>Configuração</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Sair</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
