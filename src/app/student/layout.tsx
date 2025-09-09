
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Book, Compass, GraduationCap, LogOut, Menu, ShoppingBag } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { signOut, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  SidebarTrigger
} from '@/components/ui/sidebar';

const menuItems = [
  { href: '/student/explore', label: 'Explore', icon: Compass },
  { href: '/student/courses', label: 'Meus Cursos', icon: Book },
  { href: '/student/certificates', label: 'Certificados', icon: GraduationCap },
  { href: '/student/purchases', label: 'Minhas Compras', icon: ShoppingBag },
];

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    getGlobalSettingsForTenant(MAIN_TENANT_ID).then(settings => {
        if(settings) {
            setLogoUrl(settings.logoUrl);
        }
    })

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: 'Logout bem-sucedido!' });
    router.push('/login');
  };

  if (loading) {
      return <div>Carregando...</div>;
  }
  
  if (!user) {
      router.push('/login');
      return null;
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="p-4">
              <Logo logoUrl={logoUrl} />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
              {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                  <Link href={item.href} passHref>
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
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
              <SidebarMenuItem>
                   <Link href="/student/profile" className="block rounded-md p-2 hover:bg-muted">
                      <div className="flex items-center gap-3">
                          <Avatar>
                              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'Avatar'} />
                              <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className='overflow-hidden'>
                              <p className="text-sm font-medium truncate">{user.displayName ?? 'Aluno'}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                      </div>
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
      <SidebarInset>
         <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <SidebarTrigger>
                <Menu />
            </SidebarTrigger>
            <div className="md:hidden">
                <Logo logoUrl={logoUrl} />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
