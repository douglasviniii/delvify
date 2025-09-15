
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, doc, getDoc, deleteDoc, setDoc } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function togglePostLike(tenantId: string, postId: string, userId: string) {
    if (!tenantId || !postId || !userId) {
        throw new Error("Missing required IDs for liking a post.");
    }

    const likeRef = adminDb.collection(`tenants/${tenantId}/blog/${postId}/likes`).doc(userId);

    try {
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
        revalidatePath(`/student/blog/${postId}`); // Also revalidate the specific post page

    } catch (error) {
        console.error("Error toggling post like:", error);
        // Optionally, throw the error to be caught by the calling function
        throw new Error("Could not update like status.");
    }
}
