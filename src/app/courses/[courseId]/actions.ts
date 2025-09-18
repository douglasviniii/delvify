
'use server';

import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const reviewSchema = z.object({
  courseId: z.string(),
  tenantId: z.string(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, "Seu comentário precisa ter pelo menos 10 caracteres.").max(1000, "O comentário não pode exceder 1000 caracteres."),
  userId: z.string(),
  userName: z.string(),
  userAvatar: z.string().url().nullable(),
});

type ReviewState = {
    message?: string;
    success: boolean;
    issues?: string[];
}

export async function submitReview(
  prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
    const validatedFields = reviewSchema.safeParse({
        courseId: formData.get('courseId'),
        tenantId: formData.get('tenantId'),
        rating: formData.get('rating'),
        comment: formData.get('comment'),
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

    const { courseId, tenantId, userId, userName, userAvatar, rating, comment } = validatedFields.data;

    try {
        const adminDb = getAdminDb();
        const reviewRef = adminDb.collection(`tenants/${tenantId}/courses/${courseId}/reviews`).doc(userId);
        
        await reviewRef.set({
            authorId: userId,
            authorName: userName,
            authorAvatarUrl: userAvatar,
            rating,
            comment,
            createdAt: FieldValue.serverTimestamp()
        }, { merge: true });

        revalidatePath(`/courses/${courseId}`);
        revalidatePath(`/student/courses/${courseId}`);

        return { success: true, message: "Avaliação enviada com sucesso!" };

    } catch (error) {
        console.error("Error submitting review: ", error);
        return { success: false, message: "Ocorreu um erro ao enviar sua avaliação." };
    }
}
