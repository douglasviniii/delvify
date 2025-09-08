
'use client'

import { ArrowLeft, Eye, Palette, Type, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import Image from 'next/image';
import { ArrowRight, Layers, Newspaper, Palette as PaletteIcon, ShieldCheck } from 'lucide-react';
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { useParams } from "next/navigation";


// Mock data representing the sections of the "Home" page.
// In a real application, this would be fetched from a database based on the pageId.
const initialHomePageSections = [
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
      titleColor: "#000000",
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
        { icon: 'Layers', title: 'Arquitetura Multi-Inquilino', description: 'Isole e sirva conteúdo, marca e páginas de destino personalizadas com base no domínio.' },
        { icon: 'Palette', title: 'Painel de Administração Específico do Inquilino', description: 'Gerencie cursos, marca e usuários com uma interface de administração dedicada, incluindo personalização com IA.' },
        { icon: 'Newspaper', title: 'Motor de Blog', description: 'Compartilhe notícias e atualizações com uma plataforma de blog simples e integrada para cada domínio de inquilino.' },
        { icon: 'ShieldCheck', title: 'Autenticação Segura de Usuário', description: 'Níveis de acesso separados para administradores e alunos com um sistema seguro de login e registro.' },
      ],
      titleColor: "#000000",
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
      titleColor: "#000000",
    },
  },
];

const getPageData = (pageId: string) => {
  // For now, we only have data for the home page
  if (pageId === 'home') {
    return {
      title: 'Página Inicial',
      sections: initialHomePageSections,
    };
  }
  // Return a default structure for other pages
  return {
    title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
    sections: [{ id: 'default', name: 'Conteúdo Principal', component: 'DefaultSection', settings: { title: 'Título Padrão', description: 'Descrição Padrão.', titleColor: '#000000' } }],
  };
};

const SectionComponents: { [key: string]: React.FC<any> } = {
  HeroSection: ({ settings }) => (
    <section className={`relative py-20 md:py-32 bg-gradient-to-b ${settings.backgroundColor}`}>
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl" style={{ color: settings.titleColor }}>
            {settings.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            {settings.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                {settings.primaryButtonText} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#">{settings.secondaryButtonText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  ),
  FeaturesSection: ({ settings }) => {
    const featureIcons: { [key: string]: React.ReactNode } = {
        Layers: <Layers className="h-8 w-8 text-primary" />,
        Palette: <PaletteIcon className="h-8 w-8 text-primary" />,
        Newspaper: <Newspaper className="h-8 w-8 text-primary" />,
        ShieldCheck: <ShieldCheck className="h-8 w-8 text-primary" />,
    };

    return (
        <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>
                {settings.title}
            </h2>
            <p className="mt-4 text-muted-foreground">
                {settings.description}
            </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {settings.features.map((feature: any) => (
                <Card key={feature.title} className="text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {featureIcons[feature.icon]}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                </Card>
            ))}
            </div>
        </div>
        </section>
    );
  },
  AiCustomizationSection: ({ settings }) => (
    <section className="bg-card py-12 md:py-24">
        <div className="container px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>
                {settings.title}
            </h2>
            <p className="mt-4 text-muted-foreground">
                {settings.description}
            </p>
            <Button asChild className="mt-6">
                <Link href="/admin/settings">
                {settings.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
            </div>
            <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-lg">
            <Image
                src={settings.imageUrl}
                alt="Personalização com IA"
                layout="fill"
                objectFit="cover"
                data-ai-hint="abstract technology"
            />
            </div>
        </div>
        </div>
    </section>
  ),
  DefaultSection: ({ settings }) => (
    <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl" style={{ color: settings.titleColor }}>{settings.title}</h2>
            <p className="mt-4 text-muted-foreground">{settings.description}</p>
        </div>
    </section>
  )
};

const PagePreview = ({ sections }: { sections: any[] }) => {
    return (
        <div className="h-full w-full overflow-auto bg-white">
            <main className="flex-1">
                {sections.map(section => {
                    const Component = SectionComponents[section.component];
                    return Component ? <Component key={section.id} settings={section.settings} /> : null;
                })}
            </main>
        </div>
    )
}


export default function EditSitePage() {
  const params = useParams();
  const pageId = params.pageId as string;
  const pageData = getPageData(pageId);
  const [sections, setSections] = useState(pageData.sections);

  const handleSettingChange = (sectionId: string, key: string, value: string) => {
    setSections(prevSections => {
        return prevSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    settings: {
                        ...section.settings,
                        [key]: value
                    }
                }
            }
            return section;
        })
    })
  }

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
            <div className="flex h-full items-center justify-center bg-muted/40 overflow-auto">
                <PagePreview sections={sections} />
            </div>
            <aside className="h-full overflow-y-auto border-l bg-background">
              <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                {sections.map((section) => (
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
                                if (key === 'features' || typeof value !== 'string' || key === 'backgroundColor' || key === 'titleColor') return null;
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                <div className="space-y-2" key={key}>
                                    <Label htmlFor={`${section.id}-${key}`}>{label}</Label>
                                    {key.includes('description') ? (
                                        <Textarea id={`${section.id}-${key}`} value={value as string} onChange={e => handleSettingChange(section.id, key, e.target.value)} />
                                    ) : (
                                        <Input id={`${section.id}-${key}`} value={value as string} onChange={e => handleSettingChange(section.id, key, e.target.value)} />
                                    )}
                                </div>
                                )
                            })}
                        </TabsContent>
                        <TabsContent value="style" className="space-y-4 pt-4">
                            {Object.entries(section.settings).map(([key, value]) => {
                                if ((key !== 'backgroundColor' && key !== 'titleColor') || typeof value !== 'string') return null;
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                <div className="space-y-2" key={key}>
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor={`${section.id}-${key}`}>{label}</Label>
                                      {key === 'titleColor' && 
                                        <Input 
                                          type="color" 
                                          id={`${section.id}-${key}-picker`} 
                                          value={value as string} 
                                          onChange={e => handleSettingChange(section.id, key, e.target.value)}
                                          className="p-0 h-6 w-6 border-none"
                                          />
                                      }
                                    </div>
                                    <Input id={`${section.id}-${key}`} value={value as string} onChange={e => handleSettingChange(section.id, key, e.target.value)} />
                                </div>
                                )
                            })}
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
