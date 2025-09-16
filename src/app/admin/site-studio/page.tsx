
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileEdit, PlusCircle, Settings, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from "react";
import { savePageVisibility } from "./settings/actions";
import { getGlobalSettings } from "@/lib/settings";
import type { GlobalSettings } from "@/lib/settings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";


export default function AdminSiteStudioPage() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const pages = [
    { id: "home", title: "Página Inicial", description: "A página principal de boas-vindas do seu site." },
    { id: "courses", title: "Cursos", description: "A página que lista todos os cursos disponíveis." },
    { id: "blog", title: "Blog", description: "A página com as postagens do seu blog." },
    { id: "faq", title: "FAQ", description: "Página de perguntas e respostas frequentes." },
    { id: "about", title: "Quem Somos", description: "A página que conta a história da sua empresa." },
    { id: "contact", title: "Contato", description: "A página com informações de contato e formulário." },
    { id: "privacy-policy", title: "Política de Privacidade", description: "Edite o conteúdo da sua política de privacidade." },
    { id: "terms-of-use", title: "Termos de Uso", description: "Edite o conteúdo dos seus termos de uso." },
    { id: "cookie-policy", title: "Política de Cookies", description: "Edite o conteúdo da sua política de cookies." },
    { id: "refund-policy", title: "Política de Reembolso", description: "Edite o conteúdo da sua política de reembolso." },
    { id: "support-policy", title: "Política de Atendimento", description: "Edite a política de atendimento e suporte." },
    { id: "copyright-policy", title: "Política de Direitos Autorais", description: "Edite a política de direitos autorais." },
  ];

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getGlobalSettings(user.uid)
        .then(savedSettings => {
          if (savedSettings) {
            setSettings(savedSettings);
          }
        })
        .catch(() => {
          toast({ title: "Erro", description: "Não foi possível carregar as configurações de visibilidade da página.", variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, toast]);

  const handleVisibilityChange = async (pageId: string, isVisible: boolean) => {
    if (!user || !settings) return;

    // Optimistic update
    const originalSettings = settings;
    const newSettings = {
        ...settings,
        pageVisibility: {
            ...settings.pageVisibility,
            [pageId]: isVisible,
        }
    };
    setSettings(newSettings);

    const result = await savePageVisibility(user.uid, pageId, isVisible);

    if (!result.success) {
        // Revert on failure
        setSettings(originalSettings);
        toast({
            title: "Erro",
            description: result.message,
            variant: "destructive",
        });
    } else {
         toast({
            title: "Visibilidade Atualizada",
            description: `A página '${pages.find(p => p.id === pageId)?.title}' agora está ${isVisible ? 'visível' : 'oculta'}.`,
        });
    }
  };


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
            <CardContent className="flex flex-col gap-4">
               <Button asChild variant="outline" className="w-full">
                <Link href={`/admin/site-studio/${page.id}`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Editar Página
                </Link>
              </Button>
              {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`visibility-${page.id}`}
                    checked={settings?.pageVisibility[page.id] ?? true}
                    onCheckedChange={(checked) => handleVisibilityChange(page.id, checked)}
                  />
                   <Label htmlFor={`visibility-${page.id}`} className="flex items-center gap-1 text-sm text-muted-foreground">
                      {settings?.pageVisibility[page.id] ?? true ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {settings?.pageVisibility[page.id] ?? true ? "Visível" : "Oculto"}
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
