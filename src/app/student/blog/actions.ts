
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function togglePostLike(tenantId: string, postId: string, userId: string) {
    if (!tenantId || !postId || !userId) {
        throw new Error("Missing required IDs for liking a post.");
    }

    const likeRef = adminDb.collection(`tenants/${tenantId}/blog/${postId}/likes`).doc(userId);
    const likeDoc = await likeRef.get();

    if (likeDoc.exists) {
        // User has already liked the post, so we "unlike" it
        await likeRef.delete();
    } else {
        // User has not liked the post, so we "like" it
        await likeRef.set({
            createdAt: FieldValue.serverTimestamp()
        });
    }

    // Revalidate the path to update the UI for other users.
    revalidatePath('/student/blog');
}
