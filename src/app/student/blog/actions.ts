
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function togglePostLike(tenantId: string, postId: string, userId: string) {
    if (!tenantId || !postId || !userId) {
        throw new Error("Missing required IDs for liking a post.");
    }
    const adminDb = getAdminDb();
    const postRef = adminDb.collection(`tenants/${tenantId}/blog`).doc(postId);
    const likeRef = postRef.collection('likes').doc(userId);

    const likeDoc = await likeRef.get();

    try {
        if (likeDoc.exists) {
            // User has already liked the post, so we unlike it
            await likeRef.delete();
            // We could also decrement a like count on the post document if we had one
        } else {
            // User has not liked the post, so we like it
            await likeRef.set({
                userId: userId,
                createdAt: FieldValue.serverTimestamp()
            });
            // We could also increment a like count on the post document if we had one
        }

        // Revalidate the blog page to show the updated like count/status
        revalidatePath('/student/blog', 'page');

    } catch (error) {
        console.error("Error toggling post like:", error);
        throw new Error("Could not update like status.");
    }
}
