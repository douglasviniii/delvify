
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function TenantRepassesPage() {

  return (
    <div className="space-y-6">
       <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Meus Repasses Financeiros</h1>
        <p className="text-muted-foreground">Acompanhe os extratos e as datas de pagamento dos seus repasses.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Extratos de Repasse</CardTitle>
          <CardDescription>
            A cada dia 1º, um novo extrato é gerado com base nas vendas do mês anterior. Os pagamentos são realizados até o 5º dia útil.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex h-[40vh] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mt-4">Nenhum extrato de repasse gerado</h2>
                    <p className="text-muted-foreground mt-2">Assim que você realizar sua primeira venda, os extratos aparecerão aqui.</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
