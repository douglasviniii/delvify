
'use client';

import Certificate from '@/components/certificate';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { CertificateSettings, Module } from '@/lib/types';

interface CertificateClientProps {
    studentName: string;
    studentCpf: string;
    courseName: string;
    purchaseDate: string;
    courseDurationHours: number;
    courseModules: Module[];
    settings: CertificateSettings | null;
}


export default function CertificateClient(props: CertificateClientProps) {
    const [completionDate, setCompletionDate] = useState<Date | null>(null);

    useEffect(() => {
        if (props.purchaseDate && props.courseDurationHours) {
            const purchaseDateObj = new Date(props.purchaseDate);
            const completionDateObj = new Date(purchaseDateObj.getTime() + (props.courseDurationHours * 60 * 60 * 1000));
            setCompletionDate(completionDateObj);
        }
    }, [props.purchaseDate, props.courseDurationHours]);
    
    if (!completionDate) {
        return (
             <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Calculando dados do certificado...</p>
            </div>
        );
    }

    return (
        <Certificate
            studentName={props.studentName}
            studentCpf={props.studentCpf}
            courseName={props.courseName}
            completionDate={completionDate}
            courseModules={props.courseModules}
            settings={props.settings ?? null}
        />
    );
}
