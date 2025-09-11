
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Palette, Upload, Info, Share2, Instagram, Facebook, Youtube, Linkedin, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, storage } from '@/lib/firebase';
import { saveGlobalSettings, getGlobalSettings } from './actions';
import type { GlobalSettings } from '@/lib/types';
import Link from 'next/link';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="h-5 w-5" /> },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="h-5 w-5" /> },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="h-5 w-5" /> },
    { id: 'youtube', name: 'YouTube', icon: <Youtube className="h-5 w-5" /> },
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle className="h-5 w-5" /> },
];

const initialSettings: GlobalSettings = {
    logoUrl: "https://picsum.photos/128/32?random=logo",
    primaryColor: "#9466FF",
    footerInfo: {
        email: 'contato@delvind.com',
        phone: '45 8800-0647',
        cnpj: '57.278.676/0001-69',
        cnpjLink: 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=57278676000169',
        copyrightText: `© ${new Date().getFullYear()} DelviFy Tecnologia Da Informação LTDA.`,
    },
    socialLinks: {
        instagram: { enabled: true, url: 'https://instagram.com' },
        facebook: { enabled: true, url: 'https://facebook.com' },
        linkedin: { enabled: false, url: '' },
        youtube: { enabled: false, url: '' },
        whatsapp: { enabled: true, url: 'https://wa.me/554588000647' },
    },
    socialsLocation: {
        showInHeader: false,
        showInFooter: true,
    },
    pageVisibility: {},
    colors: {
        navbarLinkColor: "#333333",
        navbarLinkHoverColor: "#9466FF",
        footerLinkColor: "#333333",
        footerLinkHoverColor: "#9466FF",
    }
};


export default function GlobalSettingsPage() {
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    const [settings, setSettings] = useState<GlobalSettings>(initialSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getGlobalSettings(user.uid)
                .then(savedSettings => {
                    // Deep merge saved settings with initial settings to prevent missing keys
                    if (savedSettings) {
                        setSettings(prev => ({
                            ...prev,
                            ...savedSettings,
                            footerInfo: {
                                ...prev.footerInfo,
                                ...(savedSettings.footerInfo || {})
                            },
                            socialLinks: {
                                ...prev.socialLinks,
                                ...(savedSettings.socialLinks || {})
                            },
                            socialsLocation: {
                                ...prev.socialsLocation,
                                ...(savedSettings.socialsLocation || {})
                            },
                            colors: {
                                ...prev.colors,
                                ...(savedSettings.colors || {})
                            }
                        }));
                    }
                })
                .catch(err => {
                    console.error("Falha ao buscar configurações:", err);
                    toast({ title: "Erro", description: "Não foi possível carregar as configurações.", variant: "destructive" });
                })
                .finally(() => setIsLoading(false));
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, toast]);


    const handleSaveChanges = async () => {
        if (!user) {
            toast({ title: "Erro", description: "Você precisa estar logado para salvar.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        const result = await saveGlobalSettings(user.uid, settings);
        setIsSaving(false);

        toast({
            title: result.success ? "Sucesso!" : "Erro!",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });

    };
    
    const handleLogoImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;
        
        setIsUploading(true);
        try {
            const filePath = `tenants/${user.uid}/global/logo.${file.name.split('.').pop()}`;
            const storageRef = ref(storage, filePath);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            handleSettingChange('logoUrl', downloadURL);
            toast({ title: 'Sucesso', description: 'Nova logo carregada.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            toast({ title: "Erro de Upload", description: errorMessage, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSettingChange = (key: keyof GlobalSettings, value: any) => {
        setSettings(prev => ({...prev, [key]: value}));
    }

    const handleNestedChange = (parentKey: keyof GlobalSettings, childKey: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [parentKey]: {
                ...(prev[parentKey] as object),
                [childKey]: value
            }
        }));
    }
    
    const handleSocialChange = (platform: keyof GlobalSettings['socialLinks'], key: 'enabled' | 'url', value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: {
                    ...prev.socialLinks[platform],
                    [key]: value
                }
            }
        }));
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                  <Link href="/admin/site-studio">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                  </Link>
                </Button>
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações Globais do Site</h1>
                    <p className="text-muted-foreground">Gerencie a identidade visual e informações que aparecem em todo o site.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
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
                                    <AvatarImage src={settings.logoUrl ?? undefined} alt="Logo" />
                                    <AvatarFallback>LG</AvatarFallback>
                                </Avatar>
                                <Input value={settings.logoUrl || ''} onChange={(e) => handleSettingChange('logoUrl', e.target.value)} placeholder="Cole a URL da sua logo"/>
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    Carregar
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleLogoImageChange} className="hidden" accept="image/*" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="primary-color">Cor Principal (Botões e Destaques)</Label>
                            <div className="flex items-center gap-2">
                                <Input id="primary-color" value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="max-w-xs"/>
                                <Input type="color" value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="h-10 w-10 p-1"/>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Cores da Navegação (Cabeçalho)</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="navbar-link-color">Cor do Link</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="navbar-link-color" value={settings.colors.navbarLinkColor} onChange={(e) => handleNestedChange('colors', 'navbarLinkColor', e.target.value)} className="max-w-xs"/>
                                        <Input type="color" value={settings.colors.navbarLinkColor} onChange={(e) => handleNestedChange('colors', 'navbarLinkColor', e.target.value)} className="h-10 w-10 p-1"/>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="navbar-link-hover-color">Cor do Link (Hover)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="navbar-link-hover-color" value={settings.colors.navbarLinkHoverColor} onChange={(e) => handleNestedChange('colors', 'navbarLinkHoverColor', e.target.value)} className="max-w-xs"/>
                                        <Input type="color" value={settings.colors.navbarLinkHoverColor} onChange={(e) => handleNestedChange('colors', 'navbarLinkHoverColor', e.target.value)} className="h-10 w-10 p-1"/>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium">Cores do Rodapé</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="footer-link-color">Cor do Link</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="footer-link-color" value={settings.colors.footerLinkColor} onChange={(e) => handleNestedChange('colors', 'footerLinkColor', e.target.value)} className="max-w-xs"/>
                                        <Input type="color" value={settings.colors.footerLinkColor} onChange={(e) => handleNestedChange('colors', 'footerLinkColor', e.target.value)} className="h-10 w-10 p-1"/>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="footer-link-hover-color">Cor do Link (Hover)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="footer-link-hover-color" value={settings.colors.footerLinkHoverColor} onChange={(e) => handleNestedChange('colors', 'footerLinkHoverColor', e.target.value)} className="max-w-xs"/>
                                        <Input type="color" value={settings.colors.footerLinkHoverColor} onChange={(e) => handleNestedChange('colors', 'footerLinkHoverColor', e.target.value)} className="h-10 w-10 p-1"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Redes Sociais</CardTitle>
                        <CardDescription>Gerencie os links das suas redes sociais e onde eles serão exibidos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {socialPlatforms.map(platform => (
                            <div key={platform.id} className="flex items-center gap-4">
                                <div className="flex items-center gap-2 w-32">
                                    {platform.icon}
                                    <Label htmlFor={`social-url-${platform.id}`}>{platform.name}</Label>
                                </div>
                                <div className="flex-1">
                                    <Input
                                        id={`social-url-${platform.id}`}
                                        placeholder={`https://${platform.id}.com/seu-perfil`}
                                        value={settings.socialLinks[platform.id as keyof typeof settings.socialLinks].url}
                                        onChange={e => handleSocialChange(platform.id as keyof typeof settings.socialLinks, 'url', e.target.value)}
                                        disabled={!settings.socialLinks[platform.id as keyof typeof settings.socialLinks].enabled}
                                    />
                                </div>
                                <Switch
                                    checked={settings.socialLinks[platform.id as keyof typeof settings.socialLinks].enabled}
                                    onCheckedChange={checked => handleSocialChange(platform.id as keyof typeof settings.socialLinks, 'enabled', checked)}
                                />
                            </div>
                        ))}
                        <Separator />
                        <div className="space-y-4">
                            <Label>Onde exibir os ícones?</Label>
                             <div className="flex items-center space-x-2">
                                <Switch
                                    id="show-in-header"
                                    checked={settings.socialsLocation.showInHeader}
                                    onCheckedChange={(checked) => handleNestedChange('socialsLocation', 'showInHeader', checked)}
                                />
                                <Label htmlFor="show-in-header">Exibir no Cabeçalho</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch
                                    id="show-in-footer"
                                    checked={settings.socialsLocation.showInFooter}
                                    onCheckedChange={(checked) => handleNestedChange('socialsLocation', 'showInFooter', checked)}
                                />
                                <Label htmlFor="show-in-footer">Exibir no Rodapé</Label>
                            </div>
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
                            <Input id="footer-email" value={settings.footerInfo.email} onChange={(e) => handleNestedChange('footerInfo', 'email', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-phone">Telefone</Label>
                            <Input id="footer-phone" value={settings.footerInfo.phone} onChange={(e) => handleNestedChange('footerInfo', 'phone', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-cnpj">CNPJ</Label>
                            <Input id="footer-cnpj" value={settings.footerInfo.cnpj} onChange={(e) => handleNestedChange('footerInfo', 'cnpj', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-cnpj-link">Link de Consulta do CNPJ</Label>
                            <Input id="footer-cnpj-link" value={settings.footerInfo.cnpjLink} onChange={(e) => handleNestedChange('footerInfo', 'cnpjLink', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footer-copyright">Texto de Copyright</Label>
                            <Input id="footer-copyright" value={settings.footerInfo.copyrightText} onChange={(e) => handleNestedChange('footerInfo', 'copyrightText', e.target.value)} />
                            <p className="text-xs text-muted-foreground">Use {'{YEAR}'} para inserir o ano atual automaticamente.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : "Salvar Configurações Globais"}
                </Button>
            </div>
        </div>
    );
}
