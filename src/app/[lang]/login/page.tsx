
'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Locale } from '@/../i18n.config';
import { getDictionary } from '@/lib/get-dictionary';

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
  const [dictionary, setDictionary] = useState<any>(null);

  const params = useParams();
  const lang = params.lang as string;

  useEffect(() => {
    getGlobalSettingsForTenant(MAIN_TENANT_ID).then(settings => {
      if(settings) {
        setLogoUrl(settings.logoUrl);
      }
    });
    
    getDictionary(lang).then(dict => {
        setDictionary(dict);
    });

  }, [lang]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const tenantDocRef = doc(db, 'tenants', user.uid);
      const tenantDocSnap = await getDoc(tenantDocRef);
      
      if (tenantDocSnap.exists()) {
        toast({
          title: 'Login de Admin bem-sucedido!',
          description: 'Redirecionando para o painel...',
        });
        router.push(`/${lang}/admin/dashboard`);
      } else {
        toast({
          title: 'Login bem-sucedido!',
          description: 'Redirecionando para sua área...',
        });
        router.push(`/${lang}/student/courses`);
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

  if (!dictionary) {
    return <div className="flex h-screen w-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  const t = dictionary.login;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-8">
        <Logo logoUrl={logoUrl}/>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.title}</CardTitle>
          <CardDescription>
            {t.description}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t.email_label}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.email_placeholder}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t.password_label}</Label>
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
                  {t.logging_in_button}
                </>
              ) : (
                t.login_button
              )}
            </Button>
          </CardFooter>
        </form>
        
        <Separator className="my-4" />
        
        <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
          {t.no_account}
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 pb-6">
            <Button variant="outline" asChild>
                <Link href={`/${lang}/signup/student`}>
                    <UserPlus className="mr-2 h-4 w-4"/>
                    {t.student_signup}
                </Link>
            </Button>
             <Button variant="outline" asChild>
                <Link href={`/${lang}/signup/tenant`}>
                    <Building className="mr-2 h-4 w-4"/>
                    {t.seller_signup}
                </Link>
            </Button>
        </div>

      </Card>
    </div>
  );
}
