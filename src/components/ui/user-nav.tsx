
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LifeBuoy, LogOut, Settings, User as UserIcon } from "lucide-react";
import { signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


export function UserNav({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: 'Logout bem-sucedido!' });
    router.push('/login');
  };

  const getProfileLink = () => {
    // A simple way to distinguish between an admin/tenant and a student.
    // In a real app, this could be based on custom claims in Firebase Auth.
    return user.uid === 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2' ? '/admin/profile' : '/student/profile';
  }

  return (
    <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificações</span>
        </Button>

        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'Avatar'} />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <Link href={getProfileLink()}>
                    <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                </DropdownMenuItem>
                 <DropdownMenuItem>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Suporte</span>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
