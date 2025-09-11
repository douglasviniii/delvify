
'use client';

import { notFound, useParams } from 'next/navigation';
import { getCourseForCertificate, getSettingsForCertificate } from './actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import type { CertificateSettings, Module, Course } from '@/lib/types';
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
                const data = await getCourseForCertificate(TENANT_ID_WITH_COURSES, courseId, user.uid);

                if (!data.success || !data.course || !data.modules) {
                    toast({
                        title: "Erro ao Carregar Certificado",
                        description: data.message || "Você não tem permissão para ver este certificado ou o curso não existe.",
                        variant: "destructive",
                    });
                    // maybe redirect instead of 404
                    notFound();
                    return;
                }
                
                const certSettings = await getSettingsForCertificate(TENANT_ID_WITH_COURSES);


                setCourse(data.course);
                setModules(data.modules);
                setSettings(certSettings);

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

    if (!course || !user) {
        // This will be caught by the notFound in useEffect, but as a safeguard.
        return null;
    }

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
            <Certificate
                studentName={user.displayName || 'Aluno Sem Nome'}
                courseName={course.title}
                completionDate={new Date()} // Placeholder, logic for actual completion date can be added later
                courseModules={modules}
                settings={settings}
            />
        </div>
    );
}
