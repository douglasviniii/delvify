

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
  File,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useState, useEffect } from 'react';

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
import { signOut, User } from 'firebase/auth';
import { getTenantProfile } from './profile/actions';
import { Skeleton } from '@/components/ui/skeleton';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/blog', label: 'Studio de Blog', icon: Newspaper },
  { href: '/admin/courses', label: 'Studio de Cursos', icon: BookCopy },
  { href: '/admin/site-studio', label: 'Estudio de Site', icon: PanelTop },
  { href: '#', label: 'Páginas', icon: File },
  { href: '#', label: 'Empresas', icon: Building },
  { href: '/admin/users', label: 'Alunos', icon: GraduationCap },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Admin');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await getTenantProfile(currentUser.uid);
          if (profile) {
            setProfileImage(profile.profileImage);
            setCompanyName(profile.companyName || 'Admin');
          }
        } catch (error) {
          console.error("Failed to fetch tenant profile for layout", error);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const isSiteStudioEditorPage = pathname.startsWith('/admin/site-studio/') && pathname !== '/admin/site-studio/settings' && pathname.split('/').length > 3;

  // Retorna um layout especial apenas para a página de edição de página (ex: /admin/site-studio/home)
  if (isSiteStudioEditorPage) {
    return <main className="h-screen flex flex-col">{children}</main>;
  }


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
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profileImage ?? undefined} alt={companyName} data-ai-hint="person face" />
                        <AvatarFallback>{companyName ? companyName.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
                      </Avatar>
                      <div className="text-left overflow-hidden">
                          <p className="text-sm font-medium truncate">{companyName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mb-2">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/admin/profile">
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                </Link>
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
