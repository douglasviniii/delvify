
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function submitCommentAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; issues?: string[] }> {
    const commentSchema = z.object({
        postId: z.string(), // This is actually the slug
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

    const { postId: postSlug, tenantId, userId, userName, userAvatar, commentText } = validatedFields.data;
    
    const adminDb = getAdminDb();

    try {
        // Query for the post document using the slug to get the actual document ID
        const postQuery = await adminDb.collection(`tenants/${tenantId}/blog`).where('slug', '==', postSlug).limit(1).get();

        if (postQuery.empty) {
            return { success: false, message: "Post não encontrado para adicionar o comentário." };
        }
        const realPostId = postQuery.docs[0].id;

        const commentRef = adminDb.collection(`tenants/${tenantId}/blog/${realPostId}/comments`).doc();
        await commentRef.set({
            authorId: userId,
            authorName: userName,
            authorAvatarUrl: userAvatar,
            text: commentText,
            createdAt: FieldValue.serverTimestamp(),
            likes: 0,
        });

        revalidatePath(`/student/blog/${postSlug}`);

        return { success: true, message: "Comentário adicionado!" };

    } catch(error) {
        console.error("Error submitting comment:", error);
        return { success: false, message: "Não foi possível adicionar o comentário." };
    }
}
