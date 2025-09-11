import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/session'; 
import { getCourseById, getCourseModules } from '@/lib/courses';
import { getCertificateSettings } from '@/lib/certificates';
import type { CertificateSettings, UserProfile, Course, Module, PurchasedCourseInfo } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import Certificate from '@/components/certificate';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

// A página agora é um Server Component que faz todo o trabalho pesado.
export default async function CertificatePage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    if (!courseId) {
        notFound();
    }

    const user = await getCurrentUser();
    if (!user) {
        return redirect(`/login?callbackUrl=/student/certificates/${courseId}`);
    }

    try {
        const userDocRef = adminDb.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return <ErrorDisplay message="Perfil do aluno não encontrado." />;
        }
        
        // Manual and robust serialization
        const rawData = userDoc.data();
        const studentProfile: any = { uid: user.uid };
        for (const key in rawData) {
            const value = rawData[key];
            if (value && typeof value.toDate === 'function') {
                 studentProfile[key] = value.toDate().toISOString();
            } else if (key === 'purchasedCourses' && typeof value === 'object' && value !== null) {
                studentProfile[key] = {};
                for(const courseKey in value) {
                    const courseValue = value[courseKey];
                    studentProfile[key][courseKey] = {
                        ...courseValue,
                        purchasedAt: courseValue.purchasedAt?.toDate ? courseValue.purchasedAt.toDate().toISOString() : courseValue.purchasedAt
                    }
                }
            } else {
                studentProfile[key] = value;
            }
        }
        
        // Validations using the serialized plain object
        if (!studentProfile.purchasedCourses || !studentProfile.purchasedCourses[courseId]) {
            return <ErrorDisplay message="Este curso não foi adquirido por você ou a compra ainda não foi processada." />;
        }
        if (!studentProfile.cpf || !studentProfile.name) {
             return <ErrorDisplay message="Dados do perfil incompletos. Por favor, preencha seu nome completo e CPF em 'Meu Perfil' para emitir o certificado." />;
        }

        // TODO: Add logic to check if the student has actually completed the course.

        const [course, modules, settings] = await Promise.all([
            getCourseById(TENANT_ID_WITH_COURSES, courseId),
            getCourseModules(TENANT_ID_WITH_COURSES, courseId),
            getCertificateSettings(TENANT_ID_WITH_COURSES)
        ]);

        if (!course) {
            return <ErrorDisplay message="Curso não encontrado." />;
        }

        return (
            <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
                 <Certificate
                    studentName={studentProfile.name}
                    studentCpf={studentProfile.cpf}
                    courseName={course.title}
                    completionDate={new Date()} // Placeholder
                    courseModules={modules}
                    settings={settings}
                />
            </div>
        );

    } catch (error) {
        const message = error instanceof Error ? error.message : "Um erro desconhecido ocorreu ao buscar os dados.";
        console.error(`Error in CertificatePage: ${message}`);
        return <ErrorDisplay message={message} />;
    }
}

// Adicionando um fallback de suspense para a página
export const dynamic = 'force-dynamic';

