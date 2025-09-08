
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";

type ResponsiblePerson = {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
};

export default function AdminProfilePage() {
  const { toast } = useToast();
  
  // State for company data
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cep, setCep] = useState("");
  const [stateRegistration, setStateRegistration] = useState("");
  
  // State for bank data
  const [bank, setBank] = useState("");
  const [agency, setAgency] = useState("");
  const [account, setAccount] = useState("");
  const [accountType, setAccountType] = useState("");

  // State for responsible people
  const [responsiblePeople, setResponsiblePeople] = useState<ResponsiblePerson[]>([
    { id: 1, name: "", cpf: "", email: "", phone: "" }
  ]);

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

  const handleResponsibleChange = (id: number, field: keyof ResponsiblePerson, value: string) => {
    setResponsiblePeople(responsiblePeople.map(person => 
        person.id === id ? { ...person, [field]: value } : person
    ));
  };

  const handleSaveChanges = () => {
    const formData = {
        companyData: { companyName, cnpj, address, neighborhood, city, state, cep, stateRegistration },
        bankData: { bank, agency, account, accountType },
        responsiblePeople
    };
    
    console.log("Saving data:", formData);

    toast({
        title: "Sucesso!",
        description: "Os dados da empresa foram salvos com sucesso.",
    })
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Perfil da Empresa</h1>
        <p className="text-muted-foreground">Gerencie as informações da sua empresa e dados bancários.</p>
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
                            <Input id="company-name" placeholder="Ex: Acme Inc." value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" placeholder="00.000.000/0001-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" placeholder="Rua das Flores, 123" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="neighborhood">Bairro</Label>
                            <Input id="neighborhood" placeholder="Centro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" placeholder="São Paulo" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                             <Input id="state" placeholder="SP" value={state} onChange={(e) => setState(e.target.value)} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input id="cep" placeholder="01001-000" value={cep} onChange={(e) => setCep(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="state-registration">Inscrição Estadual</Label>
                            <Input id="state-registration" placeholder="Isento ou número" value={stateRegistration} onChange={(e) => setStateRegistration(e.target.value)} />
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
                             <Input id="bank" placeholder="Ex: Banco do Brasil" value={bank} onChange={(e) => setBank(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agency">Agência</Label>
                            <Input id="agency" placeholder="0001-9" value={agency} onChange={(e) => setAgency(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="account">Conta com dígito</Label>
                            <Input id="account" placeholder="12345-6" value={account} onChange={(e) => setAccount(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-type">Tipo de Conta</Label>
                            <Select value={accountType} onValueChange={setAccountType}>
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
        <Button size="lg" onClick={handleSaveChanges}>Salvar Alterações</Button>
      </div>
    </div>
  );
}
