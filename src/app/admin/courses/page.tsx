import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Cursos</h1>
            <p className="text-muted-foreground">Gerencie seus cursos, módulos e lições.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Curso
        </Button>
      </div>

      <div className="flex h-[50vh] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
            <h2 className="text-xl font-semibold">Nenhum Curso Ainda</h2>
            <p className="text-muted-foreground mt-2">Clique em "Adicionar Curso" para começar.</p>
        </div>
      </div>
    </div>
  );
}
