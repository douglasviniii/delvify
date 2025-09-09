
'use client'

import { ArrowLeft, Eye, Palette, Type, Settings, PlusCircle, AlignHorizontalJustifyStart, AlignHorizontalJustifyEnd, Trash2, Smartphone, Monitor, Loader2, GripVertical, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect, useActionState, useRef } from "react";
import Image from 'next/image';
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormStatus } from "react-dom";
import { savePage, getPageDataForStudio, type SavePageState } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { HeroSection, FeaturesSection, AiCustomizationSection, DefaultSection, CoursesSection, LatestPostsSection, CtaSection, BlogPageSection, AboutPageSection, FaqPageSection } from "@/components/page-sections";
import type { User } from 'firebase/auth';
import { auth, storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAllBlogPosts, type Post } from "@/lib/blog-posts";


const SectionComponents: Record<string, React.FC<any>> = {
    HeroSection,
    FeaturesSection,
    AiCustomizationSection,
    CoursesSection,
    LatestPostsSection,
    DefaultSection,
    CtaSection,
    BlogPageSection,
    AboutPageSection,
    FaqPageSection,
};

const PagePreview = ({ sections, previewMode, posts }: { sections: any[], previewMode: 'desktop' | 'mobile', posts: Post[] }) => {
    return (
        <div className={cn("bg-white shadow-lg overflow-hidden transition-all", {
            "w-full h-full rounded-lg border": previewMode === 'desktop',
            "w-[375px] h-[667px] rounded-[20px] border-[8px] border-black mx-auto": previewMode === 'mobile'
        })}>
            <div className="h-full w-full overflow-auto">
                <main className="flex-1">
                    {sections.map(section => {
                        const Component = SectionComponents[section.component];
                        if (!Component) return null;

                        const props: {[key: string]: any} = { settings: section.settings };
                        if (section.component === 'LatestPostsSection' || section.component === 'BlogPageSection') {
                            props.posts = posts;
                        }

                        return <Component key={section.id} {...props} />;
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
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const pageId = typeof params.pageId === 'string' ? params.pageId : null;
  const [pageData, setPageData] = useState<{ title: string; sections: any[] } | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isUploading, setIsUploading] = useState<string | null>(null); // Track which section is uploading
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSectionIdForUpload, setCurrentSectionIdForUpload] = useState<string | null>(null);

  const initialState: SavePageState = { message: '', success: false };
  const [state, formAction] = useActionState(savePage, initialState);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && pageId) {
        setIsLoadingPage(true);
        Promise.all([
            getPageDataForStudio(user.uid, pageId),
            getAllBlogPosts(user.uid)
        ]).then(([pageData, blogPosts]) => {
            setPageData(pageData);
            setSections(pageData.sections);
            setPosts(blogPosts);
        }).catch(err => {
            console.error(err);
            toast({ title: 'Erro ao Carregar Dados', description: 'Não foi possível buscar os dados da página ou do blog.', variant: 'destructive'});
        }).finally(() => {
            setIsLoadingPage(false)
        });
    }
  }, [pageId, user, toast]);

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && user && currentSectionIdForUpload) {
        const file = event.target.files[0];
        const sectionId = currentSectionIdForUpload;
        setIsUploading(sectionId);
        try {
            const storageRef = ref(storage, `tenants/${user.uid}/page_images/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            handleSettingChange(sectionId, 'imageUrl', downloadURL);
            toast({ title: 'Sucesso', description: 'Imagem carregada.' });
        } catch (error) {
            console.error("Upload error:", error);
            toast({ title: 'Erro de Upload', description: 'Não foi possível carregar a imagem.', variant: 'destructive' });
        } finally {
            setIsUploading(null);
            setCurrentSectionIdForUpload(null);
        }
    }
  };

  const triggerFileUpload = (sectionId: string) => {
    setCurrentSectionIdForUpload(sectionId);
    fileInputRef.current?.click();
  };
  
  const handleAddSection = () => {
    const newSection = {
      id: `new-section-${Math.random().toString(36).substr(2, 9)}`,
      name: "Seção Padrão",
      component: "DefaultSection",
      settings: {
        title: "Novo Título da Seção",
        description: "Esta é uma nova seção que você pode editar.",
        backgroundColor: "#FFFFFF",
        titleColor: "#000000",
        descriptionColor: "#6c757d",
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
    return section.component === 'ImageTextSection' || section.component === 'AiCustomizationSection' || section.component === 'AboutPageSection'
  }

  if (loadingAuth || isLoadingPage) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  
  if (!user) {
    return <div className="flex h-full items-center justify-center"><p>Por favor, faça login para editar.</p></div>
  }

  if (!pageData || !pageId) {
    return <div className="flex h-full items-center justify-center"><p>Página não encontrada.</p></div>;
  }

  return (
    <form action={formAction} className="flex h-full flex-col">
       <input type="hidden" name="pageId" value={pageId} />
       <input type="hidden" name="tenantId" value={user.uid} />
       <input type="hidden" name="sections" value={JSON.stringify(sections)} />
       {/* Hidden file input */}
       <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />

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
                <PagePreview sections={sections} previewMode={previewMode} posts={posts} />
            </div>
            <aside className="flex flex-col h-full overflow-y-auto border-l bg-background">
              <div className="flex-1 overflow-y-auto">
                <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
                  {sections.map((section) => (
                    <AccordionItem value={section.id} key={section.id} className="group/item">
                        <div className="flex items-center px-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 cursor-grab" type="button">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <AccordionTrigger className="flex-1 text-sm font-semibold hover:no-underline px-2">
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
                                  const nonContentKeys = ['features', 'items', 'faqItems', 'backgroundColor', 'titleColor', 'descriptionColor', 'cardColor', 'layout'];
                                  if (nonContentKeys.includes(key) || typeof value !== 'string') return null;
                                  
                                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                  
                                  if (key.toLowerCase().includes('imageurl')) {
                                    return (
                                        <div className="space-y-2" key={key}>
                                            <Label htmlFor={`${section.id}-${key}`}>{label}</Label>
                                            <div className="flex items-center gap-2">
                                                <Input id={`${section.id}-${key}`} value={value as string} onChange={e => handleSettingChange(section.id, key, e.target.value)} placeholder="Cole uma URL ou carregue"/>
                                                <Button type="button" variant="outline" size="icon" onClick={() => triggerFileUpload(section.id)} disabled={isUploading === section.id}>
                                                    {isUploading === section.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                             {(value as string) && (
                                                <Image 
                                                    src={value as string} 
                                                    alt="Preview da imagem" 
                                                    width={100} 
                                                    height={100} 
                                                    className="mt-2 rounded-md object-cover"
                                                />
                                            )}
                                        </div>
                                    )
                                  }

                                  return (
                                  <div className="space-y-2" key={key}>
                                      <Label htmlFor={`${section.id}-${key}`}>{label}</Label>
                                      {key.includes('description') || key.includes('story') ? (
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