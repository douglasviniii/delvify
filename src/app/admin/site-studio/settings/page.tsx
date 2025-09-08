
'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Palette, Camera, Upload, Link as LinkIcon, Info, Mail, Phone, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// This is a placeholder for the actual data fetching and saving logic.
// In a real app, this would come from a server action and be stored in Firestore.

export default function GlobalSettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock state for UI development
    const [logoUrl, setLogoUrl] = useState<string | null>("https://picsum.photos/100/100?random=logo");
    const [primaryColor, setPrimaryColor] = useState("#9466FF");
    const [footerInfo, setFooterInfo] = useState({
        email: 'contato@delvind.com',
        phone: '45 8800-0647',
        cnpj: '57.278.676/0001-69',
        cnpjLink: '#'
    });

    const handleSaveChanges = async () => {
        setIsSaving(true);
        toast({ title: "Salvando...", description: "Suas alterações estão sendo salvas." });
        // Placeholder for save logic
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        toast({ title: "Sucesso!", description: "Configurações globais salvas com sucesso." });
    };
    
    const handleLogoImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setLogoUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
    };


  return (
    <div className="space-y-6 p-4 sm:p-6">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações Globais do Site</h1>
            <p className="text-muted-foreground">Gerencie a identidade visual e informações que aparecem em todo o site.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Identidade Visual</CardTitle>
                        <CardDescription>Altere a logo e as cores principais da sua plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                             <Label>Logo do Site</Label>
                             <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border">
                                    <AvatarImage src={logoUrl ?? undefined} alt="Logo" />
                                    <AvatarFallback>LG</AvatarFallback>
                                </Avatar>
                                <Input value={logoUrl || ''} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Cole a URL da sua logo"/>
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Carregar
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleLogoImageChange} className="hidden" accept="image/*" />
                             </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="primary-color">Cor Principal (Botões e Links)</Label>
                            <div className="flex items-center gap-2">
                                <Input id="primary-color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="max-w-xs"/>
                                <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-10 p-1"/>
                            </div>
                            <p className="text-xs text-muted-foreground">Esta cor será usada em botões, links e outros elementos de destaque.</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Informações do Rodapé</CardTitle>
                        <CardDescription>Edite as informações de contato e legais que aparecem no rodapé do site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="footer-email">Email de Contato</Label>
                             <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="footer-email" value={footerInfo.email} onChange={(e) => setFooterInfo(prev => ({...prev, email: e.target.value}))} className="pl-9"/>
                             </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="footer-phone">Telefone</Label>
                             <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="footer-phone" value={footerInfo.phone} onChange={(e) => setFooterInfo(prev => ({...prev, phone: e.target.value}))} className="pl-9"/>
                             </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="footer-cnpj">CNPJ</Label>
                             <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="footer-cnpj" value={footerInfo.cnpj} onChange={(e) => setFooterInfo(prev => ({...prev, cnpj: e.target.value}))} className="pl-9"/>
                             </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="footer-cnpj-link">Link de Consulta do CNPJ</Label>
                             <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="footer-cnpj-link" value={footerInfo.cnpjLink} onChange={(e) => setFooterInfo(prev => ({...prev, cnpjLink: e.target.value}))} className="pl-9"/>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Páginas de Políticas</CardTitle>
                        <CardDescription>Gerencie o conteúdo das suas páginas de políticas e termos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">Política de Privacidade</Button>
                        <Button variant="outline" className="w-full justify-start">Termos de Uso</Button>
                        <Button variant="outline" className="w-full justify-start">Política de Cookies</Button>
                        <Button variant="outline" className="w-full justify-start">Política de Reembolso</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <div className="flex justify-end pt-4">
            <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : "Salvar Configurações Globais"}
            </Button>
        </div>
    </div>
  );
}
