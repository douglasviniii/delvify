
'use client';

import { useRouter } from 'next/navigation';
import type { CertificateSettings, Module, Course, UserProfile } from '@/lib/types';
import Certificate from '@/components/certificate';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateClientProps {
    data: {
        course: Course;
        modules: Module[];
        settings: CertificateSettings | null;
        studentProfile: UserProfile;
    } | null;
    error: string | null;
}

export function CertificateClient({ data, error }: CertificateClientProps) {
    const router = useRouter();

    if (error) {
        return (
             <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="mt-4 text-2xl font-bold text-destructive">Não foi possível carregar o certificado</h1>
                <p className="mt-2 text-muted-foreground max-w-md">{error}</p>
                <Button onClick={() => router.back()} className="mt-6">Voltar</Button>
            </div>
        )
    }

    if (!data) {
        // This case should ideally not be hit if error is handled, but it's a good fallback.
        return (
            <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Dados insuficientes para gerar o certificado.</p>
            </div>
        );
    }
    
    const { course, studentProfile, modules, settings } = data;

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
            <Certificate
                studentName={studentProfile.name}
                studentCpf={studentProfile.cpf}
                courseName={course.title}
                completionDate={new Date()} // Placeholder, a lógica para a data real pode ser adicionada depois
                courseModules={modules}
                settings={settings}
            />
        </div>
    );
}
