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

export async function submitComment(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; issues?: string[] }> {
    const z = require('zod');

    const commentSchema = z.object({
        postId: z.string(),
        tenantId: z.string(),
        userId: z.string(),
        userName: z.string(),
        userAvatar: z.string().url().nullable(),
        commentText: z.string().min(3, "O comentário deve ter pelo menos 3 caracteres.").max(1000, "O comentário não pode exceder 1000 caracteres."),
    });

    const validatedFields = commentSchema.safeParse({
        postId: formData.get('postId'),
        tenantId: formData.get('tenantId'),
        userId: formData.get('userId'),
        userName: formData.get('userName'),
        userAvatar: formData.get('userAvatar'),
        commentText: formData.get('commentText'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Dados do comentário inválidos.",
            issues: validatedFields.error.issues.map(i => i.message),
        }
    }

    const { postId, tenantId, userId, userName, userAvatar, commentText } = validatedFields.data;

    try {
        const commentRef = adminDb.collection(`tenants/${tenantId}/blog/${postId}/comments`).doc();
        await commentRef.set({
            authorId: userId,
            authorName: userName,
            authorAvatarUrl: userAvatar,
            text: commentText,
            createdAt: FieldValue.serverTimestamp(),
            likes: 0,
        });

        revalidatePath(`/student/blog/${postId}`);

        return { success: true, message: "Comentário adicionado!" };

    } catch(error) {
        console.error("Error submitting comment:", error);
        return { success: false, message: "Não foi possível adicionar o comentário." };
    }
}
