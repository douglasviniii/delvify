
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Book, Compass, GraduationCap, LogOut, Menu, ShoppingBag, User as UserIcon, Settings, Newspaper } from 'lucide-react';
import { Logo } from '@/components/logo';
import { auth } from '@/lib/firebase';
import { signOut, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserNav } from '@/components/ui/user-nav';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import MascotLoader from '@/components/ui/loader';


const menuItems = [
  { href: '/student/explore', label: 'Explore', icon: Compass },
  { href: '/student/courses', label: 'Meus Cursos', icon: Book },
  { href: '/student/blog', label: 'Blog', icon: Newspaper },
  { href: '/student/certificates', label: 'Certificados', icon: GraduationCap },
  { href: '/student/purchases', label: 'Minhas Compras', icon: ShoppingBag },
];

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const StudentSidebarMenu = () => {
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
                className="w-full justify-start gap-3"
                >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                </SidebarMenuButton>
            </Link>
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );
};


export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, loading, error] = useAuthState(auth);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
  }, [user, loading, router]);


  useEffect(() => {
    getGlobalSettingsForTenant(MAIN_TENANT_ID).then(settings => {
        if(settings) {
            setLogoUrl(settings.logoUrl);
        }
    })
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: 'Logout bem-sucedido!' });
    router.push('/login');
  };

  const isWatchPage = pathname.includes('/watch');

  if (loading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
            <MascotLoader />
        </div>
      );
  }
  
  if (!user) {
      return null;
  }

  if(isWatchPage) {
      return <main className="h-screen flex flex-col">{children}</main>;
  }


  return (
    <SidebarProvider>
      <TooltipProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="p-4">
                <Logo logoUrl={logoUrl} />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <StudentSidebarMenu />
          </SidebarContent>
          <SidebarFooter>
            <Separator className="my-2" />
            <SidebarMenu>
                <SidebarMenuItem>
                 <Link href="/student/profile">
                    <SidebarMenuButton isActive={pathname === '/student/profile'}>
                       {loading ? (
                          <>
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </>
                        ) : (
                          <>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                                <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                            </Avatar>
                            <span>{user.displayName ?? 'Meu Perfil'}</span>
                          </>
                        )}
                    </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout} className="w-full justify-start gap-3">
                      <LogOut className="h-5 w-5" />
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
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
