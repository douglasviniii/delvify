
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Building, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Tenant = {
  id: string;
  companyName: string;
  cnpj: string;
  plan: string;
  status: 'active' | 'inactive';
  createdAt: any;
};

const DescriptionListItem = ({ term, children }: { term: string, children: React.ReactNode}) => (
    <div className="flex flex-col py-3 px-4 odd:bg-muted/50 sm:flex-row sm:gap-4">
        <dt className="w-1/4 font-medium text-foreground">{term}</dt>
        <dd className="mt-1 text-muted-foreground sm:mt-0 sm:w-3/4">{children}</dd>
    </div>
)


export default function AdminCompaniesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const tenantsQuery = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(tenantsQuery, (snapshot) => {
      const tenantsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Timestamp to a serializable format (ISO string)
          if (data.createdAt instanceof Timestamp) {
              data.createdAt = data.createdAt.toDate().toISOString();
          }
          return { id: doc.id, ...data } as Tenant;
      });
      setTenants(tenantsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tenants:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleManageClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDialogOpen(true);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Empresas</h1>
            <p className="text-muted-foreground">Crie e gerencie os inquilinos (empresas) da plataforma.</p>
        </div>
        <Button asChild>
          <Link href="/signup/tenant">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Empresa
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Empresas Ativas</CardTitle>
            <CardDescription>Abaixo está a lista de todos os seus clientes (inquilinos).</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : tenants.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empresa</TableHead>
                            <TableHead>CNPJ</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Ações</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.map(tenant => (
                            <TableRow key={tenant.id}>
                                <TableCell className="font-medium">{tenant.companyName}</TableCell>
                                <TableCell>{tenant.cnpj}</TableCell>
                                <TableCell><Badge variant="secondary">{tenant.plan || 'Padrão'}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}>
                                        {tenant.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleManageClick(tenant)}>
                                                Gerenciar Empresa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Ver Painel</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                Desativar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex h-[40vh] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                        <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mt-4">Nenhuma Empresa Encontrada</h2>
                        <p className="text-muted-foreground mt-2">Clique em "Nova Empresa" para adicionar seu primeiro cliente.</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Gerenciar {selectedTenant?.companyName}</DialogTitle>
                  <DialogDescription>
                      Use as abas abaixo para gerenciar os detalhes da empresa.
                  </DialogDescription>
              </DialogHeader>
              {selectedTenant && (
                <Tabs defaultValue="details" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Detalhes Cadastrais</TabsTrigger>
                        <TabsTrigger value="domain">Domínio</TabsTrigger>
                        <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="py-4">
                        <dl className="divide-y divide-border border rounded-lg overflow-hidden">
                            <DescriptionListItem term="Nome da Empresa">
                               {selectedTenant.companyName}
                            </DescriptionListItem>
                             <DescriptionListItem term="CNPJ">
                               {selectedTenant.cnpj}
                            </DescriptionListItem>
                             <DescriptionListItem term="ID do Inquilino">
                               <code className="text-xs bg-muted p-1 rounded-sm">{selectedTenant.id}</code>
                            </DescriptionListItem>
                             <DescriptionListItem term="Plano">
                               <Badge variant="secondary">{selectedTenant.plan || 'Padrão'}</Badge>
                            </DescriptionListItem>
                             <DescriptionListItem term="Status">
                                <Badge variant={selectedTenant.status === 'active' ? 'default' : 'destructive'}>
                                    {selectedTenant.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </DescriptionListItem>
                             <DescriptionListItem term="Data de Criação">
                               {formatDate(selectedTenant.createdAt)}
                            </DescriptionListItem>
                        </dl>
                    </TabsContent>
                    <TabsContent value="domain" className="py-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuração de Domínio</CardTitle>
                                <CardDescription>
                                    Aponte um domínio personalizado para este inquilino para que ele tenha seu próprio site.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customDomain">Domínio Personalizado</Label>
                                    <Input id="customDomain" placeholder="www.dominiodocliente.com.br" />
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-2">
                                    <p className="font-bold text-foreground">Instruções de Apontamento DNS:</p>
                                    <p>1. Acesse o painel de controle do seu provedor de domínio (ex: GoDaddy, Registro.br).</p>
                                    <p>2. Vá para a seção de gerenciamento de DNS do seu domínio.</p>
                                    <p>3. Crie um novo registro do tipo <code className="bg-muted-foreground/20 px-1 py-0.5 rounded-sm">CNAME</code> com o host/nome <code className="bg-muted-foreground/20 px-1 py-0.5 rounded-sm">www</code> apontando para o valor <code className="bg-muted-foreground/20 px-1 py-0.5 rounded-sm">cname.delvify.com</code>.</p>
                                    <p>4. Salve as alterações. Pode levar até 48 horas para o domínio propagar.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="payments" className="py-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Integração de Pagamento (Stripe)</CardTitle>
                                <CardDescription>
                                    Conecte a conta Stripe do cliente para processar pagamentos diretamente.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="stripeKey">Stripe Public Key</Label>
                                    <Input id="stripeKey" placeholder="pk_live_..." />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="stripeSecret">Stripe Secret Key</Label>
                                    <Input id="stripeSecret" type="password" placeholder="sk_live_..." />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
              )}
          </DialogContent>
      </Dialog>

    </div>
  );
}
