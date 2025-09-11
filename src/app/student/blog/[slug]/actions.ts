
'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const commentSchema = z.object({
  postId: z.string(),
  tenantId: z.string(),
  commentText: z.string().min(1, "O comentário não pode estar vazio.").max(2000, "O comentário é muito longo."),
  userId: z.string(),
  userName: z.string(),
  userAvatar: z.string().url().nullable(),
});

type CommentState = {
    message?: string;
    success: boolean;
    issues?: string[];
}

export async function submitComment(
  prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
    const validatedFields = commentSchema.safeParse({
        postId: formData.get('postId'),
        tenantId: formData.get('tenantId'),
        commentText: formData.get('commentText'),
        userId: formData.get('userId'),
        userName: formData.get('userName'),
        userAvatar: formData.get('userAvatar')
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Dados inválidos.",
            issues: validatedFields.error.issues.map(i => i.message)
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

        return { success: true, message: "Comentário enviado com sucesso!" };

    } catch (error) {
        console.error("Error submitting comment: ", error);
        return { success: false, message: "Ocorreu um erro ao enviar seu comentário." };
    }
}
