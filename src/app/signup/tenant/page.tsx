
'use client';

import { useActionState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';

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
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { signupTenant } from './actions';
import { useEffect } from 'react';


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando Conta... </> ) : ( 'Criar Conta de Vendedor' )}
        </Button>
    )
}

export default function TenantSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(signupTenant, { success: false, message: ""});

  useEffect(() => {
    if (state.message) {
        toast({
            title: state.success ? 'Sucesso!' : 'Erro no Cadastro',
            description: state.message,
            variant: state.success ? 'default' : 'destructive',
        });
        if (state.success) {
            formRef.current?.reset();
            // Redireciona para o login ou painel de empresas após o sucesso
            router.push('/login');
        }
    }
  }, [state, toast, router]);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="absolute top-8">
        <Logo />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Cadastro de Vendedor</CardTitle>
          <CardDescription>
            Crie sua conta de parceiro para começar a vender seus cursos e produtos.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-4">
            
            <p className="text-sm font-medium text-foreground">Dados da Empresa</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Razão Social</Label>
                    <Input id="companyName" name="companyName" type="text" placeholder="Nome completo da sua empresa" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" required />
                </div>
            </div>

            <Separator />
            <p className="text-sm font-medium text-foreground">Dados do Administrador</p>
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="adminName">Nome Completo do Administrador</Label>
                    <Input id="adminName" name="adminName" type="text" placeholder="Seu nome completo" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail de Acesso</Label>
                    <Input id="email" name="email" type="email" placeholder="m@exemplo.com" required />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                    Faça login
                </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
