import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Alunos</h1>
            <p className="text-muted-foreground">Gerencie todos os alunos em sua plataforma.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Aluno
        </Button>
      </div>
      
      <div className="flex h-[50vh] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
            <h2 className="text-xl font-semibold">Nenhum Aluno Encontrado</h2>
            <p className="text-muted-foreground mt-2">Clique em "Adicionar Aluno" para começar.</p>
        </div>
      </div>
    </div>
  );
}
