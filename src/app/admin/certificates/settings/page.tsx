
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon, Signature, Building } from "lucide-react";
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { saveCertificateSettings, getCertificateSettings } from './actions';
import type { CertificateSettings } from '@/lib/certificates';
import { Skeleton } from '@/components/ui/skeleton';

const initialSettings: CertificateSettings = {
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    companyCnpj: '',
    additionalInfo: '',
    mainLogoUrl: null,
    watermarkLogoUrl: null,
    signatureUrl: null,
    accentColor: '#9466FF',
    signatureText: 'Diretor(a) Responsável',
};

const ImageUploadCard = ({ title, description, imageUrl, onImageChange, isSaving }: { title: string; description: string; imageUrl: string | null; onImageChange: (dataUrl: string) => void; isSaving: boolean; }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
                <div className="w-48 h-24 relative border rounded-md flex items-center justify-center bg-muted/50">
                    {imageUrl ? (
                        <Image src={imageUrl} alt={title} layout="fill" objectFit="contain" className="p-2" />
                    ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/svg+xml" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                    <Upload className="mr-2 h-4 w-4" />
                    Carregar Imagem
                </Button>
            </CardContent>
        </Card>
    );
}

export default function CertificateSettingsPage() {
    const { toast } = useToast();
    const [user, authLoading] = useAuthState(auth);
    const [settings, setSettings] = useState<CertificateSettings>(initialSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startTransition] = useTransition();

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getCertificateSettings(user.uid)
                .then(savedSettings => {
                    if (savedSettings) {
                        setSettings(savedSettings);
                    }
                })
                .catch(err => {
                    console.error("Falha ao buscar configurações:", err);
                    toast({ title: "Erro", description: "Não foi possível carregar as configurações do certificado.", variant: "destructive" });
                })
                .finally(() => setIsLoading(false));
        } else if (!authLoading) {
            setIsLoading(false);
            toast({ title: "Acesso negado", description: "Você precisa estar logado.", variant: "destructive"});
        }
    }, [user, authLoading, toast]);


    const handleSaveChanges = () => {
        if (!user) return;
        startTransition(async () => {
            const result = await saveCertificateSettings(user.uid, settings);

            toast({
                title: result.success ? "Sucesso!" : "Erro!",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });

            if (result.success && result.updatedUrls) {
                setSettings(prev => ({
                    ...prev,
                    mainLogoUrl: result.updatedUrls.mainLogoUrl,
                    watermarkLogoUrl: result.updatedUrls.watermarkLogoUrl,
                    signatureUrl: result.updatedUrls.signatureUrl,
                }));
            }
        });
    };
    
    const handleSettingChange = (key: keyof CertificateSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (isLoading || authLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações do Certificado</h1>
                <p className="text-muted-foreground">Personalize a aparência e as informações dos certificados emitidos.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> Dados da Instituição</CardTitle>
                    <CardDescription>Essas informações aparecerão no cabeçalho do certificado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Nome da Instituição</Label>
                            <Input id="companyName" value={settings.companyName} onChange={e => handleSettingChange('companyName', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="companyCnpj">CNPJ</Label>
                            <Input id="companyCnpj" value={settings.companyCnpj} onChange={e => handleSettingChange('companyCnpj', e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="companyAddress">Endereço Completo</Label>
                        <Input id="companyAddress" value={settings.companyAddress} onChange={e => handleSettingChange('companyAddress', e.target.value)} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyPhone">Telefone</Label>
                            <Input id="companyPhone" value={settings.companyPhone} onChange={e => handleSettingChange('companyPhone', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyEmail">Email</Label>
                            <Input id="companyEmail" type="email" value={settings.companyEmail} onChange={e => handleSettingChange('companyEmail', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyWebsite">Website</Label>
                            <Input id="companyWebsite" type="url" value={settings.companyWebsite} onChange={e => handleSettingChange('companyWebsite', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Ativos Visuais e Cores</CardTitle>
                    <CardDescription>Faça o upload das imagens e escolha a cor de destaque do certificado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ImageUploadCard
                            title="Logo Principal"
                            description="Aparece no topo do certificado. Use formato PNG com fundo transparente."
                            imageUrl={settings.mainLogoUrl}
                            onImageChange={dataUrl => handleSettingChange('mainLogoUrl', dataUrl)}
                            isSaving={isSaving}
                        />
                        <ImageUploadCard
                            title="Logo (Marca d'água)"
                            description="Usada como fundo do certificado com opacidade."
                            imageUrl={settings.watermarkLogoUrl}
                            onImageChange={dataUrl => handleSettingChange('watermarkLogoUrl', dataUrl)}
                            isSaving={isSaving}
                        />
                         <ImageUploadCard
                            title="Assinatura"
                            description="Assinatura digitalizada do responsável. Use PNG com fundo transparente."
                            imageUrl={settings.signatureUrl}
                            onImageChange={dataUrl => handleSettingChange('signatureUrl', dataUrl)}
                            isSaving={isSaving}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="accentColor">Cor de Destaque</Label>
                            <div className="flex items-center gap-2">
                                <Input id="accentColor" value={settings.accentColor} onChange={e => handleSettingChange('accentColor', e.target.value)} className="max-w-xs"/>
                                <Input type="color" value={settings.accentColor} onChange={e => handleSettingChange('accentColor', e.target.value)} className="h-10 w-10 p-1"/>
                            </div>
                            <p className="text-xs text-muted-foreground">Usada em detalhes e títulos do certificado.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Signature className="h-5 w-5" /> Informações Adicionais</CardTitle>
                    <CardDescription>Textos que aparecem na área da assinatura e informações complementares no verso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="signatureText">Texto da Assinatura</Label>
                            <Input id="signatureText" value={settings.signatureText} onChange={e => handleSettingChange('signatureText', e.target.value)} placeholder="Ex: Nome do Diretor, Cargo" />
                            <p className="text-xs text-muted-foreground">Aparece abaixo da imagem da assinatura.</p>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="additionalInfo">Informações Adicionais (Verso)</Label>
                            <Textarea id="additionalInfo" value={settings.additionalInfo} onChange={e => handleSettingChange('additionalInfo', e.target.value)} placeholder="Ex: Certificado válido em todo território nacional..." />
                             <p className="text-xs text-muted-foreground">Texto que aparece no verso do certificado.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : "Salvar Configurações"}
                </Button>
            </div>
        </div>
    );
}

