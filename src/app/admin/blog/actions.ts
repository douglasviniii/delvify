
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
// Temporariamente removido para corrigir o erro. Em uma aplicação real, você precisaria de uma forma de obter o usuário/inquilino no servidor.
// import { auth } from 'firebase-admin/auth'; 

interface PostData {
    title: string;
    content: string;
    status: 'draft' | 'published';
    authorId: string;
    authorName: string; 
    tenantId: string;
}

export async function createPost(formData: FormData) {
    // TODO: Implementar uma forma segura de obter o userId e tenantId (orgId) no servidor.
    const userId = "admin_user"; // Placeholder
    const orgId = "admin_tenant"; // Placeholder

    if (!userId || !orgId) {
        return { success: false, message: 'Usuário não autenticado ou não pertence a uma organização.' };
    }
    
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title || !content) {
        return { success: false, message: 'Título e conteúdo são obrigatórios.' };
    }

    try {
        const newPost: PostData = {
            title,
            content,
            status: 'draft',
            authorId: userId,
            authorName: 'Admin', // In a real app you might get this from user profile
            tenantId: orgId,
        };

        await adminDb.collection('posts').add({
            ...newPost,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath('/admin/blog');
        return { success: true, message: 'Post criado com sucesso!' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('Erro ao criar post:', errorMessage);
        return { success: false, message: `Ocorreu um erro ao criar o post: ${errorMessage}` };
    }
}
