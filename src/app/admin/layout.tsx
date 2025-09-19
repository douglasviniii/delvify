
'use client';
import {
  BookOpenCheck,
  LayoutDashboard,
  Newspaper,
  Settings,
  LogOut,
  Building,
  GraduationCap,
  Store,
  File,
  Menu,
  User as UserIcon,
  Award,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signOut, User } from 'firebase/auth';
import { getTenantProfile } from './profile/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserNav } from '@/components/ui/user-nav';

const SUPER_ADMIN_UID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/blog', label: 'Studio de Blog', icon: Newspaper },
  { href: '/admin/courses', label: 'Studio de Cursos', icon: BookOpenCheck },
  { href: '/admin/site-studio', label: 'Estudio de Site', icon: Store },
  { href: '/admin/certificates/settings', label: 'Certificados', icon: Award },
  { href: '/admin/users', label: 'Alunos', icon: GraduationCap },
  { href: '/admin/financial/repasses', label: 'Repasses Financeiros', icon: DollarSign },
];

const AdminSidebarMenu = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);
  
  const handleLinkClick = () => {
    if(setOpenMobile) {
      setOpenMobile(false);
    }
  }

  // Hide financial transfers for non-super admins
  const filteredMenuItems = user?.uid === SUPER_ADMIN_UID 
      ? menuItems.filter(item => item.href !== '/admin/financial/repasses') 
      : menuItems;

  return (
    <SidebarMenu>
      {filteredMenuItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} onClick={handleLinkClick}>
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
      {user?.uid === SUPER_ADMIN_UID && (
        <SidebarMenuItem>
          <Link href="/admin/companies" onClick={handleLinkClick}>
            <SidebarMenuButton
              isActive={pathname.startsWith('/admin/companies')}
              tooltip="Empresas & Finanças"
            >
              <Building />
              <span>Empresas & Finanças</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Admin');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const [profile, settings] = await Promise.all([
            getTenantProfile(currentUser.uid),
            getGlobalSettingsForTenant(currentUser.uid)
          ]);

          if (profile) {
            setProfileImage(profile.profileImage);
            setCompanyName(profile.companyName || 'Admin');
          }
          if(settings) {
            setLogoUrl(settings.logoUrl);
          }
        } catch (error) {
          console.error("Failed to fetch tenant profile or settings for layout", error);
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

  if (isSiteStudioEditorPage) {
    return <main className="h-screen flex flex-col">{children}</main>;
  }


  return (
    <SidebarProvider>
      <TooltipProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="p-2">
              <Logo logoUrl={logoUrl} />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <AdminSidebarMenu />
          </SidebarContent>
          <SidebarFooter>
            <Separator className="my-2" />
            <SidebarMenu>
               <SidebarMenuItem>
                 <Link href="/admin/profile">
                    <SidebarMenuButton isActive={pathname === '/admin/profile'}>
                      {isLoading ? (
                        <>
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profileImage ?? undefined} alt={companyName} data-ai-hint="person face" />
                            <AvatarFallback>{companyName ? companyName.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
                          </Avatar>
                          <span>Perfil</span>
                        </>
                      )}
                    </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
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
        <div className="flex h-screen flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden">
                        <Menu />
                    </SidebarTrigger>
                </div>
                <div className="flex flex-1 justify-center">
                    <div className="hidden md:block">
                        <Logo logoUrl={logoUrl} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <UserNav />
                </div>
            </header>
            <SidebarInset>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            </SidebarInset>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}

    