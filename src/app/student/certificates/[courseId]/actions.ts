
'use server';

import { getCourseById, getCourseModules, hasPurchasedCourse } from '@/lib/courses';
import { getCertificateSettings } from '@/lib/certificates';
import type { CertificateSettings, UserProfile, Course, Module } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';

// Função de serialização para garantir que Timestamps sejam convertidos em strings
const serializeDoc = (doc: FirebaseFirestore.DocumentSnapshot): any => {
    const data = doc.data();
    if (!data) return null;
    
    const serializedData: { [key: string]: any } = { id: doc.id };
    for (const [key, value] of Object.entries(data)) {
        if (value && typeof value.toDate === 'function') {
            serializedData[key] = value.toDate().toISOString();
        } else {
            serializedData[key] = value;
        }
    }
    return serializedData;
};

// Ação combinada para buscar todos os dados necessários para o certificado
export async function getCertificatePageData(tenantId: string, courseId: string, userId: string) {
    try {
        if (!userId || !tenantId || !courseId) {
            throw new Error("Informações insuficientes para buscar os dados do certificado.");
        }

        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new Error("Perfil do aluno não encontrado.");
        }

        const studentProfile = serializeDoc(userDoc) as UserProfile;
        const purchasedCourses = userDoc.data()?.purchasedCourses;
        
        if (!purchasedCourses || !purchasedCourses[courseId]) {
            throw new Error("Este curso não foi adquirido por você.");
        }
        
        // TODO: Adicionar lógica para verificar se o aluno realmente concluiu o curso.
        // Por exemplo, verificar o progresso, notas de provas, etc.

        const [course, modules, settings] = await Promise.all([
            getCourseById(tenantId, courseId),
            getCourseModules(tenantId, courseId),
            getCertificateSettings(tenantId)
        ]);

        if (!course) {
            throw new Error("Curso não encontrado.");
        }

        return {
            success: true,
            course,
            modules,
            settings,
            studentProfile
        };

    } catch (error) {
        const message = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error(`Error in getCertificatePageData: ${message}`);
        return { success: false, message };
    }
}

// Funções individuais mantidas caso sejam usadas em outros lugares, mas a ação principal é getCertificatePageData
export async function getCourseForCertificate(tenantId: string, courseId: string, userId: string) {
    try {
        const isPurchased = await hasPurchasedCourse(userId, courseId);
        if (!isPurchased) {
            return { success: false, message: 'Curso não adquirido.' };
        }

        const [course, modules] = await Promise.all([
            getCourseById(tenantId, courseId),
            getCourseModules(tenantId, courseId)
        ]);

        if (!course) {
            return { success: false, message: 'Curso não encontrado.' };
        }
        
        // TODO: Add logic to verify if the student has actually completed the course.

        return { success: true, course, modules };

    } catch (error) {
        const message = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error(`Error in getCourseForCertificate: ${message}`);
        return { success: false, message: "Falha ao buscar dados do curso." };
    }
}


export async function getSettingsForCertificate(tenantId: string): Promise<CertificateSettings | null> {
    try {
        const settings = await getCertificateSettings(tenantId);
        return settings;
    } catch (error) {
        console.error("Error fetching certificate settings in action", error);
        return null;
    }
}

export async function getStudentProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) {
        return null;
    }
    try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
            return serializeDoc(userDoc) as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching student profile:", error);
        return null;
    }
}
