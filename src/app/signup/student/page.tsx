
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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

export default function StudentSignupPage() {
  const [name, setName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cep, setCep] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Erro de Validação',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Define o nome de exibição (saudação) como o nome social ou o primeiro nome do usuário.
      const displayName = socialName || name.split(' ')[0];

      // Atualiza o perfil do Firebase Auth
      await updateProfile(user, { displayName });
      
      // Salva os dados completos no Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        socialName: socialName || name, // Salva o nome social ou o nome completo se o social estiver vazio
        email,
        cpf,
        birthDate,
        address,
        neighborhood,
        city,
        state,
        cep,
        createdAt: new Date(),
        photoURL: null // Inicia com a foto nula
      });

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Você já pode fazer o login.',
      });
      router.push('/login');

    } catch (error: any) {
      console.error('Erro de cadastro:', error);
      let errorMessage = 'Ocorreu um erro ao criar a conta.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      }
      toast({
        title: 'Erro de Cadastro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="absolute top-8">
        <Logo />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Cadastro de Aluno</CardTitle>
          <CardDescription>
            Crie sua conta para começar a aprender.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo (para certificados e faturas)</Label>
                    <Input id="name" type="text" placeholder="Seu nome completo" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="socialName">Nome Social / Apelido</Label>
                    <Input id="socialName" type="text" placeholder="Como devemos te chamar?" required value={socialName} onChange={(e) => setSocialName(e.target.value)} />
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" required value={cpf} onChange={(e) => setCpf(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="birth-date">Data de Nascimento</Label>
                    <Input id="birth-date" type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </div>
            </div>

            <Separator />
            <p className="text-sm font-medium text-foreground">Endereço</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço (Rua e Número)</Label>
                    <Input id="address" placeholder="Ex: Rua das Flores, 123" required value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" required value={cep} onChange={(e) => setCep(e.target.value)} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" placeholder="Centro" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="São Paulo" required value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" placeholder="SP" required value={state} onChange={(e) => setState(e.target.value)} />
                </div>
            </div>

            <Separator />
             <p className="text-sm font-medium text-foreground">Dados de Acesso</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="m@exemplo.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" placeholder="Mínimo 6 caracteres" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cadastrando... </> ) : ( 'Criar Conta' )}
            </Button>
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
