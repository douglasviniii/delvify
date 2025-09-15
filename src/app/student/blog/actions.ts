'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function togglePostLike(tenantId: string, postId: string, userId: string) {
    if (!tenantId || !postId || !userId) {
        throw new Error("Missing required IDs for liking a post.");
    }

    const likeRef = adminDb.collection(`tenants/${tenantId}/blog/${postId}/likes`).doc(userId);

    try {
        const likeDoc = await likeRef.get();

        if (likeDoc.exists) {
            await likeRef.delete();
        } else {
            await likeRef.set({
                createdAt: FieldValue.serverTimestamp()
            });
        }
        
        // Revalidate both paths to ensure like counts are updated everywhere
        revalidatePath('/student/blog');
        revalidatePath(`/student/blog/${postId}`);

    } catch (error) {
        console.error("Error toggling post like:", error);
        // In a real app, you might want to return a more structured error
        throw new Error("Could not update like status.");
    }
}
