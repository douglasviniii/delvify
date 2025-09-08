
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileEdit, PlusCircle, Settings } from "lucide-react";
import Link from "next/link";

export default function AdminSiteStudioPage() {
  const pages = [
    { id: "home", title: "Página Inicial", description: "A página principal de boas-vindas do seu site." },
    { id: "courses", title: "Cursos", description: "A página que lista todos os cursos disponíveis." },
    { id: "blog", title: "Blog", description: "A página com as postagens do seu blog." },
    { id: "about", title: "Quem Somos", description: "A página que conta a história da sua empresa." },
    { id: "contact", title: "Contato", description: "A página com informações de contato e formulário." },
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
         <Card className="border-primary/50 border-2">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Configurações Globais</span>
              </CardTitle>
              <CardDescription>Edite a logo, cores, rodapé e outras configurações que se aplicam a todo o site.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/admin/site-studio/settings`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Editar Configurações
                </Link>
              </Button>
            </CardContent>
          </Card>
        {pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <CardTitle className="font-headline">{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/admin/site-studio/${page.id}`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Editar Página
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
