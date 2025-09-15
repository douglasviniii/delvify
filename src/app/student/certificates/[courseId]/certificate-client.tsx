
'use client';

import Certificate from '@/components/certificate';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert } from 'lucide-react';
import React from 'react';
import type { CertificateSettings, Module } from '@/lib/types';

interface CertificateClientProps {
    studentName?: string;
    studentCpf?: string;
    courseName?: string;
    completionDate?: Date;
    courseModules?: Module[];
    settings?: CertificateSettings | null;
    error?: string;
}

function LoadingCertificate() {
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando dados do certificado...</p>
        </div>
    );
}

function ErrorDisplay({ message }: { message: string }) {
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center text-center">
           <ShieldAlert className="h-16 w-16 text-destructive" />
           <h1 className="mt-4 text-2xl font-bold text-destructive">Não foi possível gerar o certificado</h1>
           <p className="mt-2 text-muted-foreground max-w-md">{message}</p>
           <Button onClick={() => window.history.back()} className="mt-6">Voltar</Button>
       </div>
    )
}


export default function CertificateClient({ error, ...props }: CertificateClientProps) {
    if (error) {
        return <ErrorDisplay message={error} />;
    }
    
    // Se não houver erro, mas as props estiverem faltando, mostramos um loader/erro genérico
    if (!props.studentName || !props.studentCpf || !props.courseName || !props.completionDate || !props.courseModules) {
        return <LoadingCertificate />;
    }

    return (
        <Certificate
            studentName={props.studentName}
            studentCpf={props.studentCpf}
            courseName={props.courseName}
            completionDate={props.completionDate}
            courseModules={props.courseModules}
            settings={props.settings ?? null}
        />
    );
}
