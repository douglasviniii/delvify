
'use client';

import { useState, useEffect, useTransition } from 'react';
import { auth, db } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Save } from 'lucide-react';
import { updateStudentProfile } from './actions';


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

const initialProfileState: UserProfile = {
    name: '',
    socialName: '',
    email: '',
    cpf: '',
    birthDate: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
};

export default function StudentProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(initialProfileState);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setIsLoading(true);
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
  
  const handleInputChange = (field: keyof UserProfile, value: string) => {
      setProfile(prev => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
      if (!user) return;

      startTransition(async () => {
          const result = await updateStudentProfile(user.uid, profile);
          if (result.success) {
              toast({ title: "Sucesso!", description: "Seu perfil foi atualizado."});
              setIsEditing(false);
          } else {
              toast({ title: "Erro", description: result.message, variant: "destructive"});
          }
      });
  }

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
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar Perfil
              </Button>
            )}
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
                        <Input id="name" value={profile.name} onChange={(e) => handleInputChange('name', e.target.value)} readOnly={!isEditing} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="socialName">Nome Social / Apelido</Label>
                        <Input id="socialName" value={profile.socialName} onChange={(e) => handleInputChange('socialName', e.target.value)} readOnly={!isEditing} />
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
                        <Input id="cpf" value={profile.cpf} onChange={(e) => handleInputChange('cpf', e.target.value)} readOnly={!isEditing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input id="birthDate" type="date" value={profile.birthDate} onChange={(e) => handleInputChange('birthDate', e.target.value)} readOnly={!isEditing} />
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
                        <Input id="address" value={profile.address} onChange={(e) => handleInputChange('address', e.target.value)} readOnly={!isEditing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input id="cep" value={profile.cep} onChange={(e) => handleInputChange('cep', e.target.value)} readOnly={!isEditing} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input id="neighborhood" value={profile.neighborhood} onChange={(e) => handleInputChange('neighborhood', e.target.value)} readOnly={!isEditing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" value={profile.city} onChange={(e) => handleInputChange('city', e.target.value)} readOnly={!isEditing} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input id="state" value={profile.state} onChange={(e) => handleInputChange('state', e.target.value)} readOnly={!isEditing} />
                    </div>
                </div>
            </CardContent>
             {isEditing && (
                <CardFooter className="justify-end gap-4">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                    </Button>
                </CardFooter>
            )}
        </Card>
    </div>
  );
}
