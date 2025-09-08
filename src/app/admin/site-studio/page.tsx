import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileEdit, PlusCircle } from "lucide-react";

export default function AdminSiteStudioPage() {
  const pages = [
    { title: "Página Inicial", description: "A página principal de boas-vindas do seu site." },
    { title: "Cursos", description: "A página que lista todos os cursos disponíveis." },
    { title: "Blog", description: "A página com as postagens do seu blog." },
    { title: "Quem Somos", description: "A página que conta a história da sua empresa." },
    { title: "Contato", description: "A página com informações de contato e formulário." },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Estúdio de Site</h1>
            <p className="text-muted-foreground">Personalize e gerencie as páginas do seu site.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Página
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.title}>
            <CardHeader>
              <CardTitle className="font-headline">{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <FileEdit className="mr-2 h-4 w-4" />
                Editar Página
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
