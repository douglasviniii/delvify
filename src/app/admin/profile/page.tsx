
'use client';

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTenantProfile, saveTenantProfile } from "./actions";
import { User } from "firebase/auth";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


type ResponsiblePerson = {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
};

type CompanyData = {
    companyName: string;
    cnpj: string;
    address: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    stateRegistration: string;
    profileImage: string | null;
}

type BankData = {
    bank: string;
    agency: string;
    account: string;
    accountType: string;
}

const initialCompanyData: CompanyData = {
    companyName: "",
    cnpj: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    cep: "",
    stateRegistration: "",
    profileImage: null,
};

const initialBankData: BankData = {
    bank: "",
    agency: "",
    account: "",
    accountType: "",
};

export default function AdminProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyData);
  const [bankData, setBankData] = useState<BankData>(initialBankData);
  const [responsiblePeople, setResponsiblePeople] = useState<ResponsiblePerson[]>([
    { id: 1, name: "", cpf: "", email: "", phone: "" }
  ]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        // O UID do usuário admin é o ID do inquilino.
        fetchProfile(currentUser.uid);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProfile = async (tenantId: string) => {
    setIsLoading(true);
    try {
      const profile = await getTenantProfile(tenantId);
      if (profile) {
        setCompanyData({
            companyName: profile.companyName || "",
            cnpj: profile.cnpj || "",
            address: profile.address || "",
            neighborhood: profile.neighborhood || "",
            city: profile.city || "",
            state: profile.state || "",
            cep: profile.cep || "",
            stateRegistration: profile.stateRegistration || "",
            profileImage: profile.profileImage || null,
        });
        setBankData(profile.bankData || initialBankData);
        setResponsiblePeople(profile.responsiblePeople && profile.responsiblePeople.length > 0 ? profile.responsiblePeople : [{ id: Date.now(), name: "", cpf: "", email: "", phone: "" }]);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível buscar os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddResponsible = () => {
    setResponsiblePeople([
      ...responsiblePeople,
      { id: Date.now(), name: "", cpf: "", email: "", phone: "" }
    ]);
  };

  const handleRemoveResponsible = (id: number) => {
    if (responsiblePeople.length > 1) {
      setResponsiblePeople(responsiblePeople.filter(person => person.id !== id));
    } else {
        toast({
            title: "Ação não permitida",
            description: "Deve haver pelo menos um responsável.",
            variant: "destructive"
        })
    }
  };

  const handleResponsibleChange = (id: number, field: keyof Omit<ResponsiblePerson, 'id'>, value: string) => {
    setResponsiblePeople(responsiblePeople.map(person => 
        person.id === id ? { ...person, [field]: value } : person
    ));
  };
  
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
        setIsUploading(true);
        try {
            const filePath = `tenants/${user.uid}/profile_images/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, filePath);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            setCompanyData(prev => ({...prev, profileImage: downloadURL}));
            toast({ title: "Sucesso", description: "Imagem de perfil carregada." });
        } catch (error) {
             const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
             toast({ title: "Erro de Upload", description: errorMessage, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
        toast({ title: "Usuário não autenticado.", variant: "destructive" });
        return;
    }
    
    setIsSaving(true);
    try {
        // O UID do usuário admin é usado como o ID do inquilino.
        const result = await saveTenantProfile(user.uid, {
            ...companyData,
            bankData,
            responsiblePeople
        });

        toast({
            title: result.success ? "Sucesso!" : "Erro!",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        })

    } catch (error) {
         toast({
            title: "Erro Inesperado",
            description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
         <div className="relative group">
            <Avatar className="h-24 w-24 border">
                <AvatarImage src={companyData.profileImage ?? undefined} alt="Foto da Empresa" />
                <AvatarFallback className="text-3xl">
                    {companyData.companyName ? companyData.companyName.charAt(0).toUpperCase() : 'C'}
                </AvatarFallback>
            </Avatar>
            <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
            >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                <span className="sr-only">Editar foto</span>
            </Button>
            <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
            />
        </div>
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Perfil da Empresa</h1>
            <p className="text-muted-foreground">Gerencie as informações da sua empresa e dados bancários.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            {/* Company Data Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados da Empresa</CardTitle>
                    <CardDescription>Informações legais e de localização da sua empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Razão Social</Label>
                            <Input id="company-name" placeholder="Ex: Acme Inc." value={companyData.companyName} onChange={(e) => setCompanyData(prev => ({...prev, companyName: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" placeholder="00.000.000/0001-00" value={companyData.cnpj} onChange={(e) => setCompanyData(prev => ({...prev, cnpj: e.target.value}))} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" placeholder="Rua das Flores, 123" value={companyData.address} onChange={(e) => setCompanyData(prev => ({...prev, address: e.target.value}))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="neighborhood">Bairro</Label>
                            <Input id="neighborhood" placeholder="Centro" value={companyData.neighborhood} onChange={(e) => setCompanyData(prev => ({...prev, neighborhood: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" placeholder="São Paulo" value={companyData.city} onChange={(e) => setCompanyData(prev => ({...prev, city: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                             <Input id="state" placeholder="SP" value={companyData.state} onChange={(e) => setCompanyData(prev => ({...prev, state: e.target.value}))} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input id="cep" placeholder="01001-000" value={companyData.cep} onChange={(e) => setCompanyData(prev => ({...prev, cep: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="state-registration">Inscrição Estadual</Label>
                            <Input id="state-registration" placeholder="Isento ou número" value={companyData.stateRegistration} onChange={(e) => setCompanyData(prev => ({...prev, stateRegistration: e.target.value}))} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bank Account Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Bancários</CardTitle>
                    <CardDescription>Informações da sua conta para recebimentos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bank">Banco</Label>
                             <Input id="bank" placeholder="Ex: Banco do Brasil" value={bankData.bank} onChange={(e) => setBankData(prev => ({...prev, bank: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agency">Agência</Label>
                            <Input id="agency" placeholder="0001-9" value={bankData.agency} onChange={(e) => setBankData(prev => ({...prev, agency: e.target.value}))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="account">Conta com dígito</Label>
                            <Input id="account" placeholder="12345-6" value={bankData.account} onChange={(e) => setBankData(prev => ({...prev, account: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-type">Tipo de Conta</Label>
                            <Select value={bankData.accountType} onValueChange={(value) => setBankData(prev => ({...prev, accountType: value}))}>
                                <SelectTrigger id="account-type">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="checking">Conta Corrente</SelectItem>
                                    <SelectItem value="savings">Conta Poupança</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
             {/* Responsible Person Card */}
            {responsiblePeople.map((person, index) => (
                <Card key={person.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Responsável pela Empresa {index + 1}</CardTitle>
                            <CardDescription>Informações do responsável legal.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveResponsible(person.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`responsible-name-${person.id}`}>Nome Completo</Label>
                            <Input id={`responsible-name-${person.id}`} placeholder="John Doe" value={person.name} onChange={e => handleResponsibleChange(person.id, 'name', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`cpf-${person.id}`}>CPF</Label>
                            <Input id={`cpf-${person.id}`} placeholder="000.000.000-00" value={person.cpf} onChange={e => handleResponsibleChange(person.id, 'cpf', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`email-${person.id}`}>E-mail</Label>
                            <Input id={`email-${person.id}`} type="email" placeholder="john.doe@example.com" value={person.email} onChange={e => handleResponsibleChange(person.id, 'email', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`phone-${person.id}`}>Telefone</Label>
                            <Input id={`phone-${person.id}`} type="tel" placeholder="(11) 99999-9999" value={person.phone} onChange={e => handleResponsibleChange(person.id, 'phone', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>
            ))}
             <Button variant="outline" className="w-full" onClick={handleAddResponsible}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Outro Responsável
            </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
