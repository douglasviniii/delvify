
'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import type { Course } from '@/lib/courses';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
        const reviewRef = adminDb.collection(`tenants/${tenantId}/courses/${courseId}/reviews`).doc(userId);
        
        await reviewRef.set({
            authorId: userId,
            authorName: userName,
            authorAvatarUrl: userAvatar,
            rating,
            comment,
            createdAt: FieldValue.serverTimestamp()
        }, { merge: true });

        return { success: true, message: "Avaliação enviada com sucesso!" };

    } catch (error) {
        console.error("Error submitting review: ", error);
        return { success: false, message: "Ocorreu um erro ao enviar sua avaliação." };
    }
}


export async function createCheckoutSession(
    course: Course,
    userId: string,
    userEmail: string,
    userDisplayName: string
): Promise<{ url?: string; error?: string }> {
    if (!course || !userId || !userEmail) {
        return { error: 'Informações do curso ou do usuário estão ausentes.' };
    }
    
    // Convert price like "99,90" or "99.90" to cents (9990)
    const priceInCents = Math.round(parseFloat(course.price.replace(',', '.')) * 100);
    
    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'boleto'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: course.title,
                            description: course.description,
                            images: [course.coverImageUrl],
                        },
                        unit_amount: priceInCents,
                    },
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            metadata: {
                userId,
                tenantId: course.tenantId,
                courseId: course.id,
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/student/courses?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/student/courses/${course.id}`,
        });
        
        if (!checkoutSession.url) {
             return { error: 'Não foi possível criar a sessão de checkout.' };
        }
        
        return { url: checkoutSession.url };

    } catch(error) {
        console.error("Stripe checkout session creation failed:", error);
        return { error: 'Falha ao comunicar com o sistema de pagamento.' };
    }
}
