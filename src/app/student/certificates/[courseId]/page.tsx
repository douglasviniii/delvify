
'use client';

import { notFound, redirect, useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { getCourseById, getCourseModules } from '@/lib/courses';
import { getCertificateSettings } from '@/lib/certificates';
import type { CertificateSettings, UserProfile, Course, Module, PurchasedCourseInfo } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import Certificate from '@/components/certificate';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

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

// Função de serialização robusta para garantir que todos os Timestamps sejam convertidos.
const serializeData = (data: any): any => {
    if (data === null || typeof data !== 'object') {
        return data;
    }
    if (data.toDate && typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(serializeData);
    }
    const serializedObject: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            serializedObject[key] = serializeData(data[key]);
        }
    }
    return serializedObject;
};

type CertificateData = {
    studentProfile: UserProfile;
    course: Course;
    modules: Module[];
    settings: CertificateSettings | null;
    purchaseInfo: PurchasedCourseInfo;
};


export default function CertificatePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
    
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            const callbackUrl = encodeURIComponent(`/student/certificates/${courseId}`);
            redirect(`/login?callbackUrl=${callbackUrl}`);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    throw new Error("Perfil do aluno não encontrado.");
                }

                const studentProfile = serializeData(userDoc.data()) as UserProfile;

                if (!studentProfile.purchasedCourses || !studentProfile.purchasedCourses[courseId]) {
                    throw new Error("Este curso não foi adquirido por você ou a compra ainda não foi processada.");
                }
                if (!studentProfile.cpf || !studentProfile.name) {
                    throw new Error("Dados do perfil incompletos. Por favor, preencha seu nome completo e CPF em 'Meu Perfil' para emitir o certificado.");
                }

                const [course, modules, settings] = await Promise.all([
                    getCourseById(TENANT_ID_WITH_COURSES, courseId),
                    getCourseModules(TENANT_ID_WITH_COURSES, courseId),
                    getCertificateSettings(TENANT_ID_WITH_COURSES)
                ]);

                if (!course) {
                    throw new Error("Curso não encontrado.");
                }

                setCertificateData({
                    studentProfile,
                    course,
                    modules,
                    settings,
                    purchaseInfo: studentProfile.purchasedCourses[courseId],
                });

            } catch (e: any) {
                console.error(`Error in CertificatePage: ${e.message}`);
                setError(e.message || "Um erro desconhecido ocorreu ao buscar os dados.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [user, authLoading, courseId, toast]);

    if (isLoading || authLoading) {
        return <LoadingCertificate />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    if (!certificateData) {
        return <ErrorDisplay message="Não foi possível carregar os dados para o certificado." />;
    }
    
    const { studentProfile, course, modules, settings, purchaseInfo } = certificateData;
    const purchaseDate = new Date(purchaseInfo.purchasedAt);
    const completionDate = new Date(purchaseDate.getTime() + (course.durationHours * 60 * 60 * 1000));


    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
            <Certificate
                studentName={studentProfile.name}
                studentCpf={studentProfile.cpf}
                courseName={course.title}
                completionDate={completionDate}
                courseModules={modules}
                settings={settings}
            />
        </div>
    );
}

export const dynamic = 'force-dynamic';
