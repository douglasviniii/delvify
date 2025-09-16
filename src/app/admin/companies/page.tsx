
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Building } from "lucide-react";

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Empresas</h1>
            <p className="text-muted-foreground">Crie e gerencie os inquilinos (empresas) da plataforma.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Empresas Ativas</CardTitle>
            <CardDescription>Abaixo está a lista de todos os seus clientes (inquilinos).</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex h-[40vh] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                    <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mt-4">Nenhuma Empresa Encontrada</h2>
                    <p className="text-muted-foreground mt-2">Clique em "Nova Empresa" para adicionar seu primeiro cliente.</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
