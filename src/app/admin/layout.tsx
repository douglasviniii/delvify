
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
  Menu,
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

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/blog', label: 'Studio de Blog', icon: Newspaper },
  { href: '/admin/courses', label: 'Studio de Cursos', icon: BookCopy },
  { href: '/admin/site-studio', label: 'Estudio de Site', icon: PanelTop },
  { href: '#', label: 'Páginas', icon: File },
  { href: '#', label: 'Empresas', icon: Building },
  { href: '/admin/users', label: 'Alunos', icon: GraduationCap },
];

const AdminSidebarMenu = () => {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  
  const handleLinkClick = () => {
    if(setOpenMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
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
            <div className="p-2">
                <Button asChild variant="ghost" className="w-full h-auto justify-start gap-2 px-2">
                  <Link href="/admin/profile">
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
                  </Link>
                </Button>
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
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
              <SidebarTrigger>
                  <Menu />
              </SidebarTrigger>
              <div className="md:hidden">
                  <Logo logoUrl={logoUrl} />
              </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
