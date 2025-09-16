
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FinancialSettingsSchema, type FinancialSettings } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Percent, DollarSign } from "lucide-react";
import { getFinancialSettings, saveFinancialSettings } from './financial-settings-actions';
import { Skeleton } from '@/components/ui/skeleton';

const initialSettings: FinancialSettings = {
    stripePercentage: 3.99,
    stripeFixed: 0.39,
    delvifyPercentage: 9,
    delvifyFixed: 0,
    taxPercentage: 6,
};

function InputWithIcon({ icon, ...props }: { icon: React.ReactNode } & React.ComponentProps<typeof Input>) {
    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {icon}
            </div>
            <Input className="pl-8" {...props} />
        </div>
    );
}

export function FinancialSettingsForm() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startTransition] = useTransition();
    const { toast } = useToast();

    const { control, handleSubmit, reset } = useForm<FinancialSettings>({
        resolver: zodResolver(FinancialSettingsSchema),
        defaultValues: initialSettings,
    });

    useEffect(() => {
        setIsLoading(true);
        getFinancialSettings()
            .then(savedSettings => {
                if (savedSettings) {
                    reset(savedSettings);
                }
            })
            .catch(() => {
                toast({ title: "Erro", description: "Não foi possível carregar as configurações financeiras.", variant: "destructive" });
            })
            .finally(() => setIsLoading(false));
    }, [reset, toast]);

    const onSubmit = (data: FinancialSettings) => {
        startTransition(async () => {
            const result = await saveFinancialSettings(data);
            toast({
                title: result.success ? "Sucesso!" : "Erro!",
                description: result.message,
                variant: result.success ? "default" : "destructive",
            });
        });
    };

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Configurações Financeiras Globais</CardTitle>
                    <CardDescription>
                        Defina as taxas padrão da plataforma que serão aplicadas a todas as vendas.
                        Esses valores são usados para calcular os repasses aos seus clientes (inquilinos).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-medium">Taxas do Gateway (Stripe)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Controller
                                name="stripePercentage"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="stripePercentage">Taxa Percentual (%)</Label>
                                        <InputWithIcon id="stripePercentage" type="number" step="0.01" {...field} icon={<Percent className="h-4 w-4 text-muted-foreground" />} />
                                    </div>
                                )}
                            />
                             <Controller
                                name="stripeFixed"
                                control={control}
                                render={({ field }) => (
                                     <div className="space-y-2">
                                        <Label htmlFor="stripeFixed">Taxa Fixa (R$)</Label>
                                        <InputWithIcon id="stripeFixed" type="number" step="0.01" {...field} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-medium">Taxas de Serviço (DelviFy)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Controller
                                name="delvifyPercentage"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="delvifyPercentage">Taxa de Serviço (%)</Label>
                                        <InputWithIcon id="delvifyPercentage" type="number" step="0.01" {...field} icon={<Percent className="h-4 w-4 text-muted-foreground" />} />
                                    </div>
                                )}
                            />
                             <Controller
                                name="delvifyFixed"
                                control={control}
                                render={({ field }) => (
                                     <div className="space-y-2">
                                        <Label htmlFor="delvifyFixed">Taxa Fixa (R$)</Label>
                                        <InputWithIcon id="delvifyFixed" type="number" step="0.01" {...field} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-medium">Impostos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Controller
                                name="taxPercentage"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label htmlFor="taxPercentage">Retenção de Impostos (%)</Label>
                                        <InputWithIcon id="taxPercentage" type="number" step="0.01" {...field} icon={<Percent className="h-4 w-4 text-muted-foreground" />} />
                                    </div>
                                )}
                            />
                        </div>
                         <p className="text-xs text-muted-foreground">
                            Percentual retido sobre o valor da venda para cobrir impostos (ex: ISS).
                        </p>
                    </div>
                     <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Salvar Configurações
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
