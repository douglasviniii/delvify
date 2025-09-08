
import { ArrowLeft, Eye, Palette, Image as ImageIcon, Type, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Mock data representing the sections of the "Home" page.
// In a real application, this would be fetched from a database based on the pageId.
const homePageSections = [
  {
    id: "hero",
    name: "Seção de Herói",
    component: "HeroSection",
    settings: {
      title: "A Plataforma Completa para Criação de Cursos",
      description: "DelviFy oferece uma solução robusta e multi-inquilino para construir, gerenciar e escalar seu negócio de educação online com facilidade.",
      primaryButtonText: "Comece Gratuitamente",
      secondaryButtonText: "Saber Mais",
      backgroundColor: "from-primary/10 to-transparent",
    },
  },
  {
    id: "features",
    name: "Seção de Recursos",
    component: "FeaturesSection",
    settings: {
      title: "Recursos Poderosos para a Educação Moderna",
      description: "Tudo que você precisa para criar uma plataforma de aprendizado online de sucesso.",
      features: [
        { title: 'Arquitetura Multi-Inquilino', description: 'Isole e sirva conteúdo, marca e páginas de destino personalizadas com base no domínio.' },
        { title: 'Painel de Administração Específico do Inquilino', description: 'Gerencie cursos, marca e usuários com uma interface de administração dedicada, incluindo personalização com IA.' },
        { title: 'Motor de Blog', description: 'Compartilhe notícias e atualizações com uma plataforma de blog simples e integrada para cada domínio de inquilino.' },
        { title: 'Autenticação Segura de Usuário', description: 'Níveis de acesso separados para administradores e alunos com um sistema seguro de login e registro.' },
      ]
    },
  },
  {
    id: "ai-customization",
    name: "Seção de IA",
    component: "AiCustomizationSection",
    settings: {
      title: "Personalize Sua Plataforma com IA",
      description: "Use linguagem natural para personalizar instantaneamente a marca do seu inquilino. Nossa ferramenta de GenAI interpreta suas instruções para criar a aparência perfeita para o seu site.",
      buttonText: "Experimente a IA de Marca",
      imageUrl: "https://picsum.photos/800/600",
    },
  },
];

const getPageData = (pageId: string) => {
  // For now, we only have data for the home page
  if (pageId === 'home') {
    return {
      title: 'Página Inicial',
      sections: homePageSections,
    };
  }
  // Return a default structure for other pages
  return {
    title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
    sections: [{ id: 'default', name: 'Conteúdo Principal', component: 'DefaultSection', settings: { title: 'Título Padrão', description: 'Descrição Padrão.' } }],
  };
};

export default function EditSitePage({ params }: { params: { pageId: string } }) {
  
  const pageData = getPageData(params.pageId);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b bg-background p-4 sm:p-6">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/site-studio">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-headline text-xl font-bold tracking-tight md:text-2xl">Editando: {pageData.title}</h1>
          <p className="text-sm text-muted-foreground">Faça alterações no conteúdo e na aparência da sua página.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
            </Button>
            <Button>Salvar Alterações</Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_380px]">
            <div className="flex h-full items-center justify-center bg-muted/40">
                <p className="text-center text-muted-foreground">A visualização da página aparecerá aqui.</p>
            </div>
            <aside className="h-full overflow-y-auto border-l bg-background">
              <Accordion type="multiple" defaultValue={pageData.sections.map(s => s.id)} className="w-full">
                {pageData.sections.map((section) => (
                  <AccordionItem value={section.id} key={section.id}>
                    <AccordionTrigger className="px-6 text-sm font-semibold hover:no-underline">{section.name}</AccordionTrigger>
                    <AccordionContent className="px-6">
                      <Tabs defaultValue="content">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="content"><Type className="w-4 h-4 mr-1"/> Conteúdo</TabsTrigger>
                          <TabsTrigger value="style"><Palette className="w-4 h-4 mr-1"/> Estilo</TabsTrigger>
                          <TabsTrigger value="advanced"><Settings className="w-4 h-4 mr-1"/> Avançado</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="space-y-4 pt-4">
                            {Object.entries(section.settings).map(([key, value]) => {
                                if (key === 'features' || typeof value !== 'string') return null;
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                <div className="space-y-2" key={key}>
                                    <Label htmlFor={`${section.id}-${key}`}>{label}</Label>
                                    {key.includes('description') ? (
                                        <Textarea id={`${section.id}-${key}`} defaultValue={value} />
                                    ) : (
                                        <Input id={`${section.id}-${key}`} defaultValue={value} />
                                    )}
                                </div>
                                )
                            })}
                        </TabsContent>
                        <TabsContent value="style" className="pt-4">
                            <p className="text-sm text-center text-muted-foreground">Opções de estilo em breve.</p>
                        </TabsContent>
                         <TabsContent value="advanced" className="pt-4">
                            <p className="text-sm text-center text-muted-foreground">Opções avançadas em breve.</p>
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </aside>
        </div>
      </div>
    </div>
  );
}
