
'use client';

import { useState, useEffect, useTransition } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Building, PlusCircle, DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { saveTenantDomain, saveTenantNotes } from './actions';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


type Tenant = {
  id: string;
  companyName: string;
  cnpj: string;
  plan: string;
  status: 'active' | 'inactive';
  createdAt: any;
  customDomain?: string;
  notes?: string;
};

const chartData = [
  { month: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Fev", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Abr", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mai", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Ago", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Set", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Out", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Dez", total: Math.floor(Math.random() * 5000) + 1000 },
]

const chartConfig = {
  total: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
}

const DescriptionListItem = ({ term, children }: { term: string, children: React.ReactNode }) => (
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
  const [domainInput, setDomainInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();


  useEffect(() => {
    const tenantsQuery = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(tenantsQuery, (snapshot) => {
      const tenantsData = snapshot.docs.map(doc => {
          const data = doc.data();
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
    setDomainInput(tenant.customDomain || '');
    setNotesInput(tenant.notes || '');
    setIsDialogOpen(true);
  }
  
  const handleSave = () => {
    if (!selectedTenant) return;
    startTransition(async () => {
        const [domainResult, notesResult] = await Promise.all([
             saveTenantDomain(selectedTenant.id, domainInput),
             saveTenantNotes(selectedTenant.id, notesInput)
        ]);

        if (domainResult.success && notesResult.success) {
            toast({ title: "Sucesso!", description: "Dados da empresa salvos com sucesso." });
            setTenants(prev => prev.map(t => t.id === selectedTenant.id ? {...t, customDomain: domainInput, notes: notesInput} : t));
        } else {
            const errorMessages = [!domainResult.success && domainResult.message, !notesResult.success && notesResult.message].filter(Boolean);
            toast({ title: "Erro", description: errorMessages.join(' '), variant: "destructive" });
        }
    })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Centro de Empresas e Financeiro</h1>
            <p className="text-muted-foreground">Gerencie seus clientes (inquilinos), finanças, repasses e configurações da plataforma.</p>
        </div>
        <Button asChild>
          <Link href="/signup/tenant">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Empresa
          </Link>
        </Button>
      </div>
      
       <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="manage">Gerenciar Empresas</TabsTrigger>
                <TabsTrigger value="financial">Financeiro</TabsTrigger>
                <TabsTrigger value="transfers">Repasses</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            <TabsContent value="manage">
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
            </TabsContent>
            <TabsContent value="financial" className="space-y-6">
                <div className="flex items-center justify-between">
                    <CardTitle>Dashboard Financeiro</CardTitle>
                     <Select>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Filtrar por empresa..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Empresas</SelectItem>
                            {tenants.map(tenant => (
                                <SelectItem key={tenant.id} value={tenant.id}>{tenant.companyName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita Bruta Total</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R$ 45.231,89</div>
                            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+1230</div>
                            <p className="text-xs text-muted-foreground">+180.1% em relação ao mês passado</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-R$ 1.231,10</div>
                            <p className="text-xs text-muted-foreground">+19% em relação ao mês passado</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Novos Inquilinos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{tenants.length}</div>
                            <p className="text-xs text-muted-foreground">Total de empresas na plataforma</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Visão Geral de Receita</CardTitle>
                        <CardDescription>Receita mensal de todas as empresas.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <ChartContainer config={chartConfig} className="h-[350px] w-full">
                            <BarChart data={chartData}>
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `R$ ${value / 1000}k`} />
                                 <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Bar dataKey="total" fill="var(--color-total)" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="transfers">
                 <Card>
                    <CardHeader><CardTitle>Faturas de Repasse</CardTitle></CardHeader>
                    <CardContent className="h-48 flex items-center justify-center text-muted-foreground">Em breve: geração e gerenciamento de faturas de repasse.</CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="settings">
                 <Card>
                    <CardHeader><CardTitle>Configurações Financeiras</CardTitle></CardHeader>
                    <CardContent className="h-48 flex items-center justify-center text-muted-foreground">Em breve: configuração de taxas e impostos da plataforma.</CardContent>
                </Card>
            </TabsContent>
      </Tabs>

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
                        <TabsTrigger value="notes">Ficha de Anotações</TabsTrigger>
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
                                    <Input 
                                      id="customDomain"
                                      placeholder="www.dominiodocliente.com.br"
                                      value={domainInput}
                                      onChange={(e) => setDomainInput(e.target.value)}
                                    />
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
                     <TabsContent value="notes" className="py-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Anotações Internas</CardTitle>
                                <CardDescription>
                                    Adicione notas, lembretes ou informações importantes sobre este cliente. Visível apenas para você.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea 
                                    placeholder="Escreva suas anotações aqui..."
                                    className="min-h-[200px]"
                                    value={notesInput}
                                    onChange={(e) => setNotesInput(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
              )}
                <div className="flex justify-end pt-4 gap-2">
                     <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Salvar Alterações
                    </Button>
                </div>
          </DialogContent>
      </Dialog>

    </div>
  );
}

    