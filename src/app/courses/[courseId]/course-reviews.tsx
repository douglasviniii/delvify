
'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitReview } from './actions';
import type { Review } from '@/lib/courses';

interface CourseReviewsProps {
    courseId: string;
    tenantId: string;
    initialReviews: Review[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enviar Avaliação
        </Button>
    )
}

function StarRating({ rating, setRating }: { rating: number, setRating: (r: number) => void }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(rating)}
                        className="focus:outline-none"
                    >
                        <Star
                            className="h-8 w-8 transition-colors"
                            fill={ratingValue <= (hover || rating) ? '#FBBF24' : 'none'}
                            stroke={ratingValue <= (hover || rating) ? '#FBBF24' : 'currentColor'}
                        />
                    </button>
                );
            })}
        </div>
    );
}


export default function CourseReviews({ courseId, tenantId, initialReviews }: CourseReviewsProps) {
    const [user, loading] = useAuthState(auth);
    const { toast } = useToast();
    const [reviews, setReviews] = useState(initialReviews);
    const formRef = useRef<HTMLFormElement>(null);
    
    const [state, formAction] = useActionState(submitReview, { success: false });

    // Handle form state changes
    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Sucesso!' : 'Erro!',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                // Optimistically add the new review to the list
                 const formData = new FormData(formRef.current!);
                 const newReview: Review = {
                     id: user!.uid, // Use user ID as temporary ID
                     authorId: user!.uid,
                     authorName: user!.displayName || 'Aluno',
                     authorAvatarUrl: user!.photoURL || undefined,
                     rating: Number(formData.get('rating')),
                     comment: String(formData.get('comment')),
                     createdAt: new Date().toISOString(),
                 };
                 setReviews(prev => [newReview, ...prev.filter(r => r.id !== newReview.id)]);
                 formRef.current?.reset();
            }
        }
    }, [state, toast, user]);

    return (
        <section className="py-12 md:py-20 border-t">
            <div className="container">
                <h2 className="font-headline text-3xl font-bold mb-8">Avaliações dos Alunos</h2>
                <div className="grid md:grid-cols-3 gap-8">
                   <div className="md:col-span-1">
                        <h3 className="text-xl font-semibold mb-4">Deixe sua avaliação</h3>
                        {user ? (
                           <form ref={formRef} action={formAction} className="space-y-4">
                                <input type="hidden" name="courseId" value={courseId} />
                                <input type="hidden" name="tenantId" value={tenantId} />
                                <input type="hidden" name="userId" value={user.uid} />
                                <input type="hidden" name="userName" value={user.displayName ?? 'Aluno Anônimo'} />
                                <input type="hidden" name="userAvatar" value={user.photoURL ?? ''} />
                                
                                <div>
                                    <label className="block mb-2 font-medium">Sua nota:</label>
                                    <input type="hidden" name="rating" value={state.rating} />
                                    <StarRating rating={state.rating} setRating={(r) => formRef.current?.querySelector<HTMLInputElement>('input[name="rating"]')!.value = String(r)} />
                                </div>
                                <div>
                                    <label htmlFor="comment" className="block mb-2 font-medium">Seu comentário:</label>
                                    <Textarea id="comment" name="comment" placeholder="Descreva sua experiência com o curso..." rows={5} required />
                                     {state?.issues?.map(issue => <p key={issue} className="text-red-500 text-sm mt-1">{issue}</p>)}
                                </div>
                                <SubmitButton />
                            </form>
                        ) : (
                            <div className="p-4 border rounded-lg bg-muted text-center">
                                <p className="text-muted-foreground">Você precisa estar logado para deixar uma avaliação.</p>
                                <Button className="mt-4">Fazer Login</Button>
                            </div>
                        )}
                   </div>
                   <div className="md:col-span-2 space-y-6">
                        {reviews.length > 0 ? reviews.map((review) => (
                           <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={review.authorAvatarUrl ?? undefined} />
                                    <AvatarFallback>{review.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">{review.authorName}</h4>
                                        <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                             <Star key={i} className="h-4 w-4" fill={i < review.rating ? '#FBBF24' : 'none'} stroke={i < review.rating ? '#FBBF24' : 'currentColor'}/>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-muted-foreground">{review.comment}</p>
                                </div>
                           </div>
                        )) : (
                            <div className="p-8 border-2 border-dashed rounded-lg text-center">
                                <p className="text-muted-foreground">Este curso ainda não tem avaliações. Seja o primeiro a avaliar!</p>
                            </div>
                        )}
                   </div>
                </div>
            </div>
        </section>
    )
}
