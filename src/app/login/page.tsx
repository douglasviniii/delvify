'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Building } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getGlobalSettingsForTenant } from '@/lib/settings';

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default function LoginPage() {
  const [email, setEmail] = useState('delvify@delvin.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    getGlobalSettingsForTenant(MAIN_TENANT_ID).then(settings => {
      setLogoUrl(settings.logoUrl);
    });
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // A simple way to distinguish between an admin/tenant and a student.
      // In a real app, this could be based on custom claims in Firebase Auth.
      if (userCredential.user.uid === 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2') {
         toast({
          title: 'Login de Admin bem-sucedido!',
          description: 'Redirecionando para o painel...',
        });
        router.push('/admin/dashboard');
      } else {
         toast({
          title: 'Login bem-sucedido!',
          description: 'Redirecionando para sua área...',
        });
        router.push('/student/courses');
      }

    } catch (error) {
      console.error('Erro de login:', error);
      toast({
        title: 'Erro de Login',
        description: 'Credenciais inválidas. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-8">
        <Logo logoUrl={logoUrl}/>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Login</CardTitle>
          <CardDescription>
            Acesse sua conta de aluno ou de administrador.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </CardFooter>
        </form>
        
        <Separator className="my-4" />
        
        <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
          Ainda não tem uma conta?
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 pb-6">
            <Button variant="outline" asChild>
                <Link href="/signup/student">
                    <UserPlus className="mr-2 h-4 w-4"/>
                    Sou Aluno
                </Link>
            </Button>
             <Button variant="outline" asChild>
                <Link href="/signup/tenant">
                    <Building className="mr-2 h-4 w-4"/>
                    Quero Vender
                </Link>
            </Button>
        </div>

      </Card>
    </div>
  );
}
