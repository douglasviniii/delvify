
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function updateCourseStatus(tenantId: string, courseId: string, newStatus: 'draft' | 'published') {
    if (!tenantId || !courseId) {
        return { success: false, message: "ID do inquilino e do curso são obrigatórios." };
    }

    try {
        const courseRef = doc(db, `tenants/${tenantId}/courses`, courseId);
        await updateDoc(courseRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
        return { success: true, message: `Status do curso atualizado para ${newStatus}.` };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error("Erro ao atualizar status do curso:", error);
        return { success: false, message: `Erro ao atualizar status: ${errorMessage}` };
    }
}
