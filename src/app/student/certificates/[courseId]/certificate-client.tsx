
'use client';

import { useRouter } from 'next/navigation';
import { getCourseForCertificate, getSettingsForCertificate, getStudentProfile } from './actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import type { CertificateSettings, Module, Course, UserProfile } from '@/lib/types';
import Certificate from '@/components/certificate';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
                const [courseDataResult, certSettings, profileData] = await Promise.all([
                    getCourseForCertificate(tenantId, courseId, user.uid),
                    getSettingsForCertificate(tenantId),
                    getStudentProfile(user.uid)
                ]);

                if (!courseDataResult.success || !courseDataResult.course || !courseDataResult.modules) {
                    throw new Error(courseDataResult.message || "Você não tem permissão para ver este certificado ou o curso não existe.");
                }
                
                if (!profileData) {
                    throw new Error("Não foi possível encontrar os dados do aluno. Complete seu perfil.");
                }

                setCourse(courseDataResult.course);
                setModules(courseDataResult.modules);
                setSettings(certSettings);
                setStudentProfile(profileData);

            } catch (err: any) {
                console.error("Falha ao carregar dados do certificado", err);
                toast({ title: "Erro", description: err.message || "Falha ao carregar os dados do certificado.", variant: "destructive" });
                setError(err.message || "Ocorreu um erro.");
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
                <h1 className="text-2xl font-bold text-destructive">Não foi possível carregar o certificado</h1>
                <p className="mt-2 text-muted-foreground">{error}</p>
                <Button onClick={() => router.back()} className="mt-4">Voltar</Button>
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
