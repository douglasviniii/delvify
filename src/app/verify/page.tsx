
'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

type VerificationStatus = 'idle' | 'loading' | 'valid' | 'invalid';

const VerificationResult = ({ status }: { status: VerificationStatus }) => {
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Verificando autenticidade...</p>
            </div>
        );
    }
    if (status === 'valid') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center text-green-600">
                <ShieldCheck className="h-16 w-16" />
                <h3 className="text-2xl font-bold">Certificado Autêntico</h3>
                <div className="text-left text-muted-foreground bg-green-50 p-4 rounded-lg border border-green-200">
                    <p><strong className="text-black">Aluno:</strong> Nome do Aluno Exemplo</p>
                    <p><strong className="text-black">Curso:</strong> Nome do Curso Exemplo</p>
                    <p><strong className="text-black">Data de Conclusão:</strong> 01 de Janeiro de 2025</p>
                </div>
            </div>
        );
    }
    if (status === 'invalid') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center text-destructive">
                <ShieldAlert className="h-16 w-16" />
                <h3 className="text-2xl font-bold">Certificado Inválido</h3>
                <p className="text-muted-foreground">O código informado não corresponde a um certificado válido em nossa base de dados.</p>
            </div>
        );
    }
     // 'idle' state
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <ShieldQuestion className="h-16 w-16 text-muted-foreground" />
             <p className="text-muted-foreground">Insira o código de verificação para consultar a autenticidade.</p>
        </div>
    );
}

function VerificationPageContent() {
    const searchParams = useSearchParams();
    const initialCode = searchParams.get('code') || '';
    const [code, setCode] = useState(initialCode);
    const [status, setStatus] = useState<VerificationStatus>('idle');


    const handleVerification = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setStatus('loading');
        // Simulação de chamada de API
        setTimeout(() => {
            // Em uma aplicação real, você faria uma chamada para o seu backend aqui.
            // O backend validaria o código no banco de dados.
            if (code.startsWith('DELV-')) {
                setStatus('valid');
            } else {
                setStatus('invalid');
            }
        }, 1500);
    }

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Verificação de Autenticidade</CardTitle>
                    <CardDescription className="text-lg">
                        Consulte a validade de um certificado emitido em nossa plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerification} className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Insira o código: DELV-ANO-XXXXX"
                            className="h-12 text-center text-lg tracking-widest font-mono"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                        />
                        <Button type="submit" size="icon" className="h-12 w-12" disabled={status === 'loading'}>
                           <Search className="h-6 w-6" />
                           <span className="sr-only">Verificar</span>
                        </Button>
                    </form>
                    <div className="mt-6 border-t pt-6">
                        <VerificationResult status={status} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex-1 py-12 md:py-20">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <VerificationPageContent />
        </Suspense>
      </main>
      <MainFooter />
    </div>
  );
}

