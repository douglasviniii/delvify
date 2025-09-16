
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

type Tenant = {
  id: string;
  companyName: string;
  cnpj: string;
  plan: string;
  status: 'active' | 'inactive';
  createdAt: any;
};

export default function AdminCompaniesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
                                            <DropdownMenuItem>
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
    </div>
  );
}
