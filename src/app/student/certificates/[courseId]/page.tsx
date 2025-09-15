
import { notFound, redirect } from 'next/navigation';
import { getCourseById, getCourseModules } from '@/lib/courses';
import { getCertificateSettings } from '@/lib/certificates';
import type { CertificateSettings, UserProfile, Course, Module, PurchasedCourseInfo } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import CertificateClient from './certificate-client';
import { db } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/session';

const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

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


async function getCertificateData(userId: string, courseId: string) {
    const userDocRef = doc(db, 'users', userId);
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

    return {
        studentProfile,
        course,
        modules,
        settings,
        purchaseInfo: studentProfile.purchasedCourses[courseId],
    };
}


export default async function CertificatePage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    const user = await getCurrentUser();

    if (!user) {
        const callbackUrl = encodeURIComponent(`/student/certificates/${courseId}`);
        redirect(`/login?callbackUrl=${callbackUrl}`);
    }
    
    try {
        const certificateData = await getCertificateData(user.uid, courseId);
        
        const purchaseDate = new Date(certificateData.purchaseInfo.purchasedAt);
        const completionDate = new Date(purchaseDate.getTime() + (certificateData.course.durationHours * 60 * 60 * 1000));

        return (
            <CertificateClient 
                studentName={certificateData.studentProfile.name}
                studentCpf={certificateData.studentProfile.cpf}
                courseName={certificateData.course.title}
                completionDate={completionDate}
                courseModules={certificateData.modules}
                settings={certificateData.settings}
            />
        );
    } catch (e: any) {
        // Se ocorrer um erro, renderizamos o componente cliente com a mensagem de erro.
        // O componente cliente pode então exibir uma UI de erro apropriada.
        return <CertificateClient error={e.message} />;
    }
}

export const dynamic = 'force-dynamic';
