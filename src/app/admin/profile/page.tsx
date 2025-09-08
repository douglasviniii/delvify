
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminProfilePage() {
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
                            <Input id="company-name" placeholder="Ex: Acme Inc." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" placeholder="00.000.000/0001-00" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" placeholder="Rua das Flores, 123" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="neighborhood">Bairro</Label>
                            <Input id="neighborhood" placeholder="Centro" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" placeholder="São Paulo" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                             <Input id="state" placeholder="SP" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input id="cep" placeholder="01001-000" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="state-registration">Inscrição Estadual</Label>
                            <Input id="state-registration" placeholder="Isento ou número" />
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
                             <Input id="bank" placeholder="Ex: Banco do Brasil" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agency">Agência</Label>
                            <Input id="agency" placeholder="0001-9" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="account">Conta com dígito</Label>
                            <Input id="account" placeholder="12345-6" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-type">Tipo de Conta</Label>
                            <Select>
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

        <div className="lg:col-span-1">
             {/* Responsible Person Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Responsável pela Empresa</CardTitle>
                    <CardDescription>Informações do responsável legal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="responsible-name">Nome Completo</Label>
                        <Input id="responsible-name" placeholder="John Doe" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" placeholder="000.000.000-00" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" placeholder="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" type="tel" placeholder="(11) 99999-9999" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg">Salvar Alterações</Button>
      </div>
    </div>
  );
}
