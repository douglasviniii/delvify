
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type UserProfile = {
  name: string;
  socialName: string;
  email: string;
  cpf: string;
  birthDate: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
};

export default function StudentProfilePage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            toast({
              title: "Perfil não encontrado",
              description: "Não foi possível carregar seus dados de perfil.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
          toast({
            title: "Erro de Servidor",
            description: "Não foi possível conectar ao banco de dados.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (!loadingAuth) {
        fetchProfile();
    }
  }, [user, loadingAuth, toast]);

  if (isLoading || loadingAuth) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Não foi possível carregar o perfil.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Meu Perfil</h1>
                <p className="text-muted-foreground">Visualize e gerencie suas informações pessoais.</p>
            </div>
            <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Suas informações de identificação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo (Legal)</Label>
                        <Input id="name" value={profile.name} readOnly />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="socialName">Nome Social / Apelido</Label>
                        <Input id="socialName" value={profile.socialName} readOnly />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={profile.email} readOnly />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" value={profile.cpf} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input id="birthDate" value={profile.birthDate} readOnly />
                    </div>
                </div>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Seu endereço para faturamento e certificados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Endereço (Rua e Número)</Label>
                        <Input id="address" value={profile.address} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input id="cep" value={profile.cep} readOnly />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input id="neighborhood" value={profile.neighborhood} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" value={profile.city} readOnly />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input id="state" value={profile.state} readOnly />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
