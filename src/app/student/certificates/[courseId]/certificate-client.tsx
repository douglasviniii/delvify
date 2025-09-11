
'use client';

import { useRouter } from 'next/navigation';
import { getCertificatePageData } from './actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import type { CertificateSettings, Module, Course, UserProfile } from '@/lib/types';
import Certificate from '@/components/certificate';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface CertificateClientProps {
    courseId: string;
    tenantId: string;
}

export function CertificateClient({ courseId, tenantId }: CertificateClientProps) {
    const router = useRouter();
    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [settings, setSettings] = useState<CertificateSettings | null>(null);
    const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (authLoading) {
            return; 
        }

        if (!user) {
            // Se não houver usuário após o carregamento, redirecione para o login
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getCertificatePageData(tenantId, courseId, user.uid);
                
                if (!result.success) {
                    throw new Error(result.message || "Não foi possível carregar os dados do certificado.");
                }

                setCourse(result.course || null);
                setModules(result.modules || []);
                setSettings(result.settings || null);
                setStudentProfile(result.studentProfile || null);

                if (!result.studentProfile || !result.studentProfile.cpf) {
                     throw new Error("Dados do perfil incompletos. Por favor, preencha seu nome completo e CPF no seu perfil para emitir o certificado.");
                }


            } catch (err: any) {
                console.error("Falha ao carregar dados do certificado", err);
                toast({ title: "Erro", description: err.message, variant: "destructive" });
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();

    }, [user, authLoading, courseId, tenantId, toast, router]);

    if (isLoading || authLoading) {
        return (
            <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Carregando dados do certificado...</p>
            </div>
        )
    }

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

    if (!course || !studentProfile) {
        // Este estado pode ocorrer brevemente ou se algo inesperado acontecer.
        return (
            <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Dados insuficientes para gerar o certificado.</p>
            </div>
        );
    }

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
