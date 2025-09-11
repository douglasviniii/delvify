
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCourseForCertificate, getSettingsForCertificate, getStudentProfile } from './actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import type { CertificateSettings, Module, Course, UserProfile } from '@/lib/types';
import Certificate from '@/components/certificate';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default function CertificatePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [settings, setSettings] = useState<CertificateSettings | null>(null);
    const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!courseId) {
            notFound();
            return;
        }

        if (authLoading) {
            return; 
        }

        if (!user) {
            // This should be handled by layout, but as a fallback
            notFound();
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [courseDataResult, certSettings, profileData] = await Promise.all([
                    getCourseForCertificate(TENANT_ID_WITH_COURSES, courseId, user.uid),
                    getSettingsForCertificate(TENANT_ID_WITH_COURSES),
                    getStudentProfile(user.uid)
                ]);

                if (!courseDataResult.success || !courseDataResult.course || !courseDataResult.modules) {
                    toast({
                        title: "Erro ao Carregar Certificado",
                        description: courseDataResult.message || "Você não tem permissão para ver este certificado ou o curso não existe.",
                        variant: "destructive",
                    });
                    notFound();
                    return;
                }
                
                if (!profileData) {
                     toast({
                        title: "Erro ao Carregar Perfil",
                        description: "Não foi possível encontrar os dados do aluno.",
                        variant: "destructive",
                    });
                    notFound();
                    return;
                }

                setCourse(courseDataResult.course);
                setModules(courseDataResult.modules);
                setSettings(certSettings);
                setStudentProfile(profileData);

            } catch (error) {
                console.error("Failed to load certificate data", error);
                toast({ title: "Erro", description: "Falha ao carregar os dados do certificado.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();

    }, [user, authLoading, courseId, toast]);

    if (isLoading || authLoading) {
        return (
            <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Carregando dados do certificado...</p>
            </div>
        )
    }

    if (!course || !studentProfile) {
        // This will be caught by the notFound in useEffect, but as a safeguard.
        return null;
    }

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
            <Certificate
                studentName={studentProfile.name}
                studentCpf={studentProfile.cpf}
                courseName={course.title}
                completionDate={new Date()} // Placeholder, logic for actual completion date can be added later
                courseModules={modules}
                settings={settings}
            />
        </div>
    );
}
