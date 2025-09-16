
'use client';

import { useState, useEffect, useTransition } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Building, PlusCircle, DollarSign, TrendingUp, TrendingDown, Users, PiggyBank, HandCoins, FileText, Loader2 as Spinner } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { saveTenantDomain, saveTenantNotes, getTenants, generateMonthlyInvoices, getGeneratedInvoices } from './actions';
import { getAllPurchases } from '@/lib/purchases';
import { getFinancialSettings } from './financial-settings-actions';
import type { FinancialSettings, Purchase, Invoice } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { FinancialSettingsForm } from './financial-settings-form';

export type Tenant = {
  id: string;
  companyName: string;
  cnpj: string;
  plan: string;
  status: 'active' | 'inactive';
  createdAt: any;
  customDomain?: string;
  notes?: string;
};

const chartConfig = {
  total: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
};

const DescriptionListItem = ({ term, children }: { term: string, children: React.ReactNode }) => (
    <div className="flex flex-col py-3 px-4 odd:bg-muted/50 sm:flex-row sm:gap-4">
        <dt className="w-1/4 font-medium text-foreground">{term}</dt>
        <dd className="mt-1 text-muted-foreground sm:mt-0 sm:w-3/4">{children}</dd>
    </div>
);


export default function AdminCompaniesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();
  const [selectedTenantFilter, setSelectedTenantFilter] = useState('all');
  
  const [invoiceMonth, setInvoiceMonth] = useState(new Date().getMonth()); // 0-indexed month
  const [invoiceYear, setInvoiceYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [tenantsData, purchasesData, settingsData] = await Promise.all([
                getTenants(),
                getAllPurchases(),
                getFinancialSettings()
            ]);
            setTenants(tenantsData);
            setPurchases(purchasesData);
            setFinancialSettings(settingsData);
        } catch (error) {
            console.error("Error fetching page data:", error);
            toast({ title: "Erro", description: "Não foi possível carregar os dados da página.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [toast]);
  
  useEffect(() => {
    // Fetch generated invoices when month/year changes
    const fetchInvoices = async () => {
      const fetchedInvoices = await getGeneratedInvoices(invoiceYear, invoiceMonth + 1);
      setInvoices(fetchedInvoices);
    };
    fetchInvoices();
  }, [invoiceYear, invoiceMonth]);


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

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    const result = await generateMonthlyInvoices(invoiceYear, invoiceMonth + 1);
    setIsGenerating(false);
    
    toast({
        title: result.success ? "Sucesso!" : "Erro!",
        description: result.message,
        variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      // Re-fetch invoices
      const fetchedInvoices = await getGeneratedInvoices(invoiceYear, invoiceMonth + 1);
      setInvoices(fetchedInvoices);
    }
  };

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

  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  
  const filteredPurchases = selectedTenantFilter === 'all'
    ? purchases
    : purchases.filter(p => p.tenantId === selectedTenantFilter);
  
  const totalRevenue = filteredPurchases.reduce((acc, p) => acc + p.amount, 0);

  let totalDelvifyProfit = 0;
  let totalTaxes = 0;
  let totalToTransfer = 0;

  if (financialSettings) {
      filteredPurchases.forEach(purchase => {
          const saleValue = purchase.amount;
          
          const taxValue = saleValue * (financialSettings.taxPercentage / 100);
          const valueAfterTaxes = saleValue - taxValue;
          
          let stripeFee = 0;
          if(purchase.paymentMethod === 'card') {
            stripeFee = valueAfterTaxes * (financialSettings.stripeCardPercentage / 100) + financialSettings.stripeCardFixed;
          } else if (purchase.paymentMethod === 'boleto') {
            stripeFee = financialSettings.stripeBoletoFixed;
          } else if (purchase.paymentMethod === 'pix') {
            stripeFee = valueAfterTaxes * (financialSettings.stripePixPercentage / 100);
          }

          const valueAfterStripe = valueAfterTaxes - stripeFee;
          
          const delvifyFee = valueAfterStripe * (financialSettings.delvifyPercentage / 100) + financialSettings.delvifyFixed;
          
          const tenantNet = valueAfterStripe - delvifyFee;

          totalDelvifyProfit += delvifyFee;
          totalTaxes += taxValue;
          totalToTransfer += tenantNet;
      });
  }
  
  const monthlyRevenue = purchases.reduce((acc, p) => {
      const month = new Date(p.createdAt).toLocaleString('pt-BR', { month: 'short' });
      acc[month] = (acc[month] || 0) + p.amount;
      return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(monthlyRevenue).map(month => ({
      month,
      total: monthlyRevenue[month]
  })).reverse();


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
                     <Select value={selectedTenantFilter} onValueChange={setSelectedTenantFilter}>
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
                            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">Total de vendas na plataforma.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lucro da Plataforma</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalDelvifyProfit)}</div>
                            <p className="text-xs text-muted-foreground">Sua receita líquida após taxas.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Impostos Retidos</CardTitle>
                            <PiggyBank className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalTaxes)}</div>
                            <p className="text-xs text-muted-foreground">Valor a ser pago em impostos.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total a Repassar</CardTitle>
                            <HandCoins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalToTransfer)}</div>
                            <p className="text-xs text-muted-foreground">Valor líquido para seus clientes.</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Visão Geral de Receita</CardTitle>
                        <CardDescription>Receita mensal de todas as empresas.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `R$ ${Number(value) / 1000}k`} />
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
                    <CardHeader>
                      <CardTitle>Faturas de Repasse</CardTitle>
                      <CardDescription>Gere e gerencie as faturas de repasse mensais para seus clientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card className="bg-muted/30">
                          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <Label className="font-medium">Gerar Faturas</Label>
                                <p className="text-sm text-muted-foreground">Selecione o período para gerar novas faturas de repasse para todas as empresas.</p>
                                <div className="flex items-center gap-2">
                                    <Select value={String(invoiceMonth)} onValueChange={(val) => setInvoiceMonth(Number(val))}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Mês" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <SelectItem key={i} value={String(i)}>
                                                    {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={String(invoiceYear)} onValueChange={(val) => setInvoiceYear(Number(val))}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Ano" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleGenerateInvoices} disabled={isGenerating} size="lg">
                                {isGenerating ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                {isGenerating ? 'Gerando Faturas...' : 'Gerar Faturas do Mês'}
                            </Button>
                           </CardContent>
                        </Card>
                        
                        <div className="border rounded-lg">
                           <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead className="text-right">Receita Bruta</TableHead>
                                    <TableHead className="text-right">Valor Líquido</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length > 0 ? invoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>
                                          <div className="font-medium">{tenants.find(t => t.id === invoice.tenantId)?.companyName || 'Empresa não encontrada'}</div>
                                          <div className="text-xs text-muted-foreground">ID: {invoice.id}</div>
                                        </TableCell>
                                        <TableCell>{`${String(invoice.month).padStart(2, '0')}/${invoice.year}`}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(invoice.totalRevenue)}</TableCell>
                                        <TableCell className="font-semibold text-right">{formatCurrency(invoice.netAmountToTransfer)}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">Ver Detalhes</Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Nenhuma fatura gerada para este período.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="settings">
                 <FinancialSettingsForm />
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
