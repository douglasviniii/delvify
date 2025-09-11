
'use server';

import { getCourseById, getCourseModules } from '@/lib/courses';
import { getCertificateSettings } from '@/lib/certificates';
import type { CertificateSettings, UserProfile, Course, Module, PurchasedCourseInfo } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';

// Função de serialização robusta para garantir que Timestamps sejam convertidos em strings, incluindo objetos aninhados e arrays.
const serializeData = (data: any): any => {
    if (!data) {
        return data;
    }
    // Trata Timestamps do Firebase Admin SDK
    if (typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    // Trata arrays recursivamente
    if (Array.isArray(data)) {
        return data.map(serializeData);
    }
    // Trata objetos recursivamente
    if (typeof data === 'object') {
        const res: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                res[key] = serializeData(data[key]);
            }
        }
        return res;
    }
    // Retorna o valor primitivo
    return data;
};

// Ação combinada para buscar todos os dados necessários para o certificado
export async function getCertificatePageData(tenantId: string, courseId: string, userId: string) {
    try {
        if (!tenantId || !courseId) {
            throw new Error("Informações insuficientes para buscar os dados do certificado.");
        }

        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new Error("Perfil do aluno não encontrado.");
        }

        // Primeiro, serializa o documento do usuário INTEIRO, incluindo os objetos aninhados como purchasedCourses.
        const studentProfile = serializeData({ id: userDoc.id, ...userDoc.data() }) as UserProfile & { purchasedCourses?: Record<string, PurchasedCourseInfo> };
        
        if (!studentProfile) {
             throw new Error("Não foi possível processar o perfil do aluno.");
        }

        // AGORA, a verificação usa os dados já serializados e seguros.
        if (!studentProfile.purchasedCourses || !studentProfile.purchasedCourses[courseId]) {
            throw new Error("Este curso não foi adquirido por você.");
        }
        
        if (!studentProfile.cpf || !studentProfile.name) {
             throw new Error("Dados do perfil incompletos. Por favor, preencha seu nome completo e CPF no seu perfil para emitir o certificado.");
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
            data: {
              course,
              modules,
              settings,
              studentProfile
            }
        };

    } catch (error) {
        const message = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error(`Error in getCertificatePageData: ${message}`);
        return { success: false, message };
    }
}
