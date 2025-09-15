'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function togglePostLike(tenantId: string, postId: string, userId: string) {
    if (!tenantId || !postId || !userId) {
        throw new Error("Missing required IDs for liking a post.");
    }

    const likeRef = adminDb.collection(`tenants/${tenantId}/blog/${postId}/likes`).doc(userId);
    const postRef = adminDb.collection(`tenants/${tenantId}/blog`).doc(postId);

    try {
        const likeDoc = await likeRef.get();

        if (likeDoc.exists) {
            // Se já curtiu, remove o like
            await likeRef.delete();
        } else {
            // Se não curtiu, adiciona o like
            await likeRef.set({
                createdAt: FieldValue.serverTimestamp()
            });
        }
        
        // Revalida o cache para que a contagem de likes seja atualizada
        revalidatePath('/student/blog');
        revalidatePath(`/student/blog/${postId}`);
        revalidatePath(`/student/blog/${postRef.path.split('/')[3]}`);


    } catch (error) {
        console.error("Error toggling post like:", error);
        throw new Error("Could not update like status.");
    }
}
