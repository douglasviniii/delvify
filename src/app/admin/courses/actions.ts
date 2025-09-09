
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, deleteDoc } from 'firebase/firestore';

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


export async function createCategory(tenantId: string, name: string) {
    if (!tenantId || !name) {
        return { success: false, message: "ID do inquilino e nome da categoria são obrigatórios." };
    }
    try {
        const categoriesCollection = collection(db, `tenants/${tenantId}/categories`);
        await addDoc(categoriesCollection, { name: name });
        return { success: true, message: "Categoria criada com sucesso." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error("Erro ao criar categoria:", error);
        return { success: false, message: `Erro ao criar categoria: ${errorMessage}` };
    }
}


export async function deleteCategory(tenantId: string, categoryId: string) {
    if (!tenantId || !categoryId) {
        return { success: false, message: "ID do inquilino e da categoria são obrigatórios." };
    }
    try {
        await deleteDoc(doc(db, `tenants/${tenantId}/categories`, categoryId));
        return { success: true, message: "Categoria removida com sucesso." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error("Erro ao remover categoria:", error);
        return { success: false, message: `Erro ao remover categoria: ${errorMessage}` };
    }
}

    