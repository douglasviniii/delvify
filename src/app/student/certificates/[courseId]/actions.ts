
'use server';

import { getCourseById, getCourseModules, hasPurchasedCourse } from '@/lib/courses';
import { getCertificateSettings } from '@/lib/certificates';
import type { CertificateSettings, UserProfile } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';


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
            return userDoc.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching student profile:", error);
        return null;
    }
}
