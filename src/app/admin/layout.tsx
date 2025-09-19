
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
  Menu,
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
import { hexToHsl } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';

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

const AdminSidebarMenu = ({ user }: { user: User | null }) => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  
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


const AdminSidebar = ({ logoUrl, profileImage, companyName }: { logoUrl: string | null, profileImage: string | null, companyName: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  
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
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            <Logo logoUrl={logoUrl} />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <AdminSidebarMenu user={user} />
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2" />
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/profile">
                  <SidebarMenuButton isActive={pathname === '/admin/profile'}>
                    {authLoading ? (
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
  );
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Admin');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#9466FF');
  const [isLoading, setIsLoading] = useState(true);
  
  const isSiteStudioEditorPage = pathname.startsWith('/admin/site-studio/') && pathname !== '/admin/site-studio/settings' && pathname.split('/').length > 3;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchData = async () => {
        try {
          const [profile, settings] = await Promise.all([
            getTenantProfile(user.uid),
            getGlobalSettingsForTenant(user.uid)
          ]);

          if (profile) {
            setProfileImage(profile.profileImage);
            setCompanyName(profile.companyName || 'Admin');
          }
          if(settings) {
            setLogoUrl(settings.logoUrl);
            setPrimaryColor(settings.primaryColor);
          }
        } catch (error) {
          console.error("Failed to fetch tenant profile or settings for layout", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchData();

  }, [user, authLoading, router, pathname]);


  if (isSiteStudioEditorPage) {
    return <main className="h-screen flex flex-col">{children}</main>;
  }

  const primaryColorHsl = hexToHsl(primaryColor);

  return (
    <>
      <style
        id="custom-admin-theme-variables"
        dangerouslySetInnerHTML={{
          __html: `:root { --primary: ${primaryColorHsl}; }`,
        }}
      />
      <SidebarProvider>
        <TooltipProvider>
          <div className="flex h-screen bg-muted/30">
              <AdminSidebar logoUrl={logoUrl} profileImage={profileImage} companyName={companyName} />
              <div className="flex flex-1 flex-col overflow-hidden">
                  <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                          <SidebarTrigger className="md:hidden">
                              <Menu />
                          </SidebarTrigger>
                           <div className="hidden md:block">
                              <Logo logoUrl={logoUrl} />
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <UserNav />
                      </div>
                  </header>
                  <SidebarInset className="flex-1">
                      <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
                  </SidebarInset>
              </div>
          </div>
        </TooltipProvider>
      </SidebarProvider>
    </>
  );
}
