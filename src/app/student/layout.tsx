
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Compass, GraduationCap, LogOut, ShoppingBag, User as UserIcon } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { signOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { getGlobalSettingsForTenant } from '@/lib/settings';

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
        setLogoUrl(settings.logoUrl);
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
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-background flex flex-col p-4">
        <div className="mb-8">
            <Logo logoUrl={logoUrl} />
        </div>
        <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
                <Link key={item.label} href={item.href} passHref>
                    <Button
                    variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </Button>
                </Link>
            ))}
        </nav>
        <div className="mt-auto space-y-1">
             <Link href="/student/profile" className="block rounded-md p-2 hover:bg-muted">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user.photoURL ?? undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='overflow-hidden'>
                        <p className="text-sm font-medium truncate">{user.displayName ?? 'Aluno'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
            </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
