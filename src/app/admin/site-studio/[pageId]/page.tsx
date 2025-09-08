

'use client'

import { ArrowLeft, Eye, Palette, Type, Settings, PlusCircle, AlignHorizontalJustifyStart, AlignHorizontalJustifyEnd, Trash2, Smartphone, Monitor, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import Image from 'next/image';
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormState, useFormStatus } from "react-dom";
import { savePage, type SavePageState } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { SectionComponents } from "@/components/page-sections";
import { initialHomePageSections } from "@/lib/page-data";


// This function now just returns default data for non-home pages
const getPageData = (pageId: string) => {
  // For now, we only have data for the home page
  if (pageId === 'home') {
    return {
      title: 'Página Inicial',
      // This is used for initial state before DB is fetched
      sections: initialHomePageSections, 
    };
  }
  // Return a default structure for other pages
  return {
    title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
    sections: [{ id: 'default', name: 'Conteúdo Principal', component: 'DefaultSection', settings: { title: 'Título Padrão', description: 'Descrição Padrão.', titleColor: '#000000', descriptionColor: "#6c757d", backgroundColor: "#FFFFFF" } }],
  };
};

const PagePreview = ({ sections, previewMode }: { sections: any[], previewMode: 'desktop' | 'mobile' }) => {
    return (
        <div className={cn("bg-white shadow-lg overflow-hidden transition-all", {
            "w-full h-full rounded-lg border": previewMode === 'desktop',
            "w-[375px] h-[667px] rounded-[20px] border-[8px] border-black mx-auto": previewMode === 'mobile'
        })}>
            <div className="h-full w-full overflow-auto">
                <main className="flex-1">
                    {sections.map(section => {
                        const Component = SectionComponents[section.component];
                        return Component ? <Component key={section.id} settings={section.settings} /> : null;
                    })}
                </main>
            </div>
        </div>
    )
}

function SaveButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                </>
            ) : (
                'Salvar Alterações'
            )}
        </Button>
    )
}

export default function EditSitePage() {
  const params = useParams();
  const { toast } = useToast();
  
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageData, setPageData] = useState<{ title: string; sections: any[] } | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const initialState: SavePageState = { message: '', success: false };
  const [state, formAction] = useFormState(savePage, initialState);

  useEffect(() => {
    setIsClient(true);
    if (typeof params.pageId === 'string') {
      const id = params.pageId;
      setPageId(id);
      const data = getPageData(id);
      setPageData(data);
      // On the client, we can fetch the latest data from our "DB"
      if (id === 'home') {
          fetch('/api/get-page-sections')
              .then(res => res.json())
              .then(data => setSections(data.sections))
              .catch(() => setSections(initialHomePageSections)); // Fallback
      } else {
          setSections(data.sections);
      }
    }
  }, [params.pageId]);

  useEffect(() => {
    if (state.message) {
        toast({
            title: state.success ? 'Sucesso!' : 'Erro!',
            description: state.message,
            variant: state.success ? 'default' : 'destructive',
        })
    }
  }, [state, toast]);

  const handleSettingChange = (sectionId: string, key: string, value: string | string[]) => {
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
  
  const handleAddSection = () => {
    const newSection = {
      id: `new-section-${Math.random().toString(36).substr(2, 9)}`,
      name: "Seção de Imagem e Texto",
      component: "ImageTextSection",
      settings: {
        title: "Novo Título da Seção",
        description: "Esta é uma nova seção que você pode editar.",
        imageUrl: "https://picsum.photos/800/600",
        buttonText: "Saiba Mais",
        buttonLink: "#",
        backgroundColor: "#FFFFFF",
        titleColor: "#000000",
        descriptionColor: "#6c757d",
        layout: "default",
      },
    };
    setSections(prevSections => [...prevSections, newSection]);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
  };


  const StyleInput = ({ sectionId, settingKey, label }: { sectionId: string, settingKey: string, label: string }) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.settings.hasOwnProperty(settingKey)) return null;
    const value = section.settings[settingKey as keyof typeof section.settings] as string;
    if (typeof value !== 'string') return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={`${sectionId}-${settingKey}`}>{label}</Label>
                <Input
                    type="color"
                    id={`${sectionId}-${settingKey}-picker`}
                    value={value}
                    onChange={e => handleSettingChange(sectionId, settingKey, e.target.value)}
                    className="p-0 h-6 w-6 border-none"
                />
            </div>
            <Input id={`${sectionId}-${settingKey}`} value={value} onChange={e => handleSettingChange(sectionId, settingKey, e.target.value)} />
        </div>
    );
};

  const hasLayout = (section: any) => {
    return section.component === 'ImageTextSection' || section.component === 'AiCustomizationSection'
  }

  if (!isClient || !pageData || !pageId) {
    return null; // Or a loading spinner
  }

  return (
    <form action={formAction} className="flex h-full flex-col">
       <input type="hidden" name="pageId" value={pageId} />
       <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      <header className="flex-shrink-0 flex items-center justify-between gap-4 border-b bg-background p-4">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
            <Link href="/admin/site-studio">
                <ArrowLeft className="h-4 w-4" />
            </Link>
            </Button>
            <div className="flex-1">
            <h1 className="font-headline text-xl font-bold tracking-tight md:text-2xl">Editando: {pageData.title}</h1>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <Button type="button" variant={previewMode === 'desktop' ? 'default' : 'outline'} size="icon" onClick={() => setPreviewMode('desktop')}>
                <Monitor className="h-4 w-4" />
                <span className="sr-only">Desktop</span>
            </Button>
            <Button type="button" variant={previewMode === 'mobile' ? 'default' : 'outline'} size="icon" onClick={() => setPreviewMode('mobile')}>
                <Smartphone className="h-4 w-4" />
                <span className="sr-only">Mobile</span>
            </Button>
        </div>

        <div className="flex items-center gap-2">
            <Button type="button" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
            </Button>
            <SaveButton />
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 md:grid-cols-[1fr_380px]">
            <div className="flex h-full items-center justify-center bg-muted/40 overflow-auto p-4 transition-all">
                <PagePreview sections={sections} previewMode={previewMode} />
            </div>
            <aside className="flex flex-col h-full overflow-y-auto border-l bg-background">
              <div className="flex-1 overflow-y-auto">
                <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                  {sections.map((section) => (
                    <AccordionItem value={section.id} key={section.id}>
                        <div className="flex items-center px-6">
                            <AccordionTrigger className="flex-1 text-sm font-semibold hover:no-underline">
                                <span>{section.name}</span>
                            </AccordionTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.id)
                                }}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Excluir seção</span>
                            </Button>
                        </div>
                      <AccordionContent className="px-6">
                        <Tabs defaultValue="content">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="content"><Type className="w-4 h-4 mr-1"/> Conteúdo</TabsTrigger>
                            <TabsTrigger value="style"><Palette className="w-4 h-4 mr-1"/> Estilo</TabsTrigger>
                            <TabsTrigger value="layout" disabled={!hasLayout(section)}><Settings className="w-4 h-4 mr-1"/> Layout</TabsTrigger>
                          </TabsList>
                          <TabsContent value="content" className="space-y-4 pt-4">
                              {Object.entries(section.settings).map(([key, value]) => {
                                  const nonContentKeys = ['features', 'backgroundColor', 'titleColor', 'descriptionColor', 'cardColor', 'layout'];
                                  if (nonContentKeys.includes(key) || typeof value !== 'string') return null;
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
                            <StyleInput sectionId={section.id} settingKey="backgroundColor" label="Cor de Fundo" />
                            <StyleInput sectionId={section.id} settingKey="titleColor" label="Cor do Título" />
                            <StyleInput sectionId={section.id} settingKey="descriptionColor" label="Cor da Descrição" />
                            {section.settings.hasOwnProperty('cardColor') && (
                                  <StyleInput sectionId={section.id} settingKey="cardColor" label="Cor do Card" />
                            )}
                          </TabsContent>
                          <TabsContent value="layout" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Posição da Imagem</Label>
                                <p className="text-sm text-muted-foreground">
                                    Escolha onde a imagem deve ser exibida em telas maiores.
                                </p>
                            </div>
                             <RadioGroup 
                                defaultValue={section.settings.layout} 
                                onValueChange={value => handleSettingChange(section.id, 'layout', value)}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="default" id={`${section.id}-layout-default`} className="peer sr-only" />
                                    <Label
                                    htmlFor={`${section.id}-layout-default`}
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <AlignHorizontalJustifyStart className="mb-3 h-6 w-6" />
                                        Esquerda
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="right" id={`${section.id}-layout-right`} className="peer sr-only" />
                                    <Label
                                    htmlFor={`${section.id}-layout-right`}
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <AlignHorizontalJustifyEnd className="mb-3 h-6 w-6" />
                                        Direita
                                    </Label>
                                </div>
                            </RadioGroup>
                          </TabsContent>
                        </Tabs>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
              <div className="p-4 border-t">
                  <Button type="button" variant="outline" className="w-full" onClick={handleAddSection}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Seção
                  </Button>
              </div>
            </aside>
        </div>
      </div>
    </form>
  );
}
