
'use server';

import { getCourseById, getCourseModules } from '@/lib/courses';
import { getCertificateSettings } from '@/lib/certificates';
import type { UserProfile } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// This is the tenant ID for which courses are being created in the admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export async function getCertificateData(userId: string, courseId: string) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return { success: false, message: "Perfil do aluno não encontrado." };
        }

        const studentProfile = serializeData(userDoc.data()) as UserProfile;
        
        if (!studentProfile.purchasedCourses || !studentProfile.purchasedCourses[courseId]) {
            return { success: false, message: "Este curso não foi adquirido por você ou a compra ainda não foi processada." };
        }
        if (!studentProfile.cpf || !studentProfile.name) {
            return { success: false, message: "Dados do perfil incompletos. Por favor, preencha seu nome completo e CPF em 'Meu Perfil' para emitir o certificado." };
        }

        const [course, modules, settings] = await Promise.all([
            getCourseById(TENANT_ID_WITH_COURSES, courseId),
            getCourseModules(TENANT_ID_WITH_COURSES, courseId),
            getCertificateSettings(TENANT_ID_WITH_COURSES)
        ]);

        if (!course) {
            return { success: false, message: "Curso não encontrado." };
        }

        const data = {
            studentProfile,
            course,
            modules,
            settings,
            purchaseInfo: studentProfile.purchasedCourses[courseId],
        };
        
        return { success: true, data: serializeData(data) };

    } catch (error: any) {
        return { success: false, message: error.message || 'Ocorreu um erro ao buscar os dados do certificado.' };
    }
}
