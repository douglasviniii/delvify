
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Review } from '@/lib/types';
import { useFormStatus } from 'react-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { submitReview } from '../[courseId]/actions';

interface CourseReviewsProps {
    initialReviews: Review[];
    courseId: string;
    tenantId: string;
    allowReview?: boolean;
}

function ReviewSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Enviar Avaliação
        </Button>
    )
}

function StarRating({ rating, setRating }: { rating: number, setRating?: (r: number) => void }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                const isReadOnly = !setRating;
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setRating?.(ratingValue)}
                        onMouseEnter={() => !isReadOnly && setHover(ratingValue)}
                        onMouseLeave={() => !isReadOnly && setHover(0)}
                        className={`focus:outline-none ${isReadOnly ? 'cursor-default' : ''}`}
                        disabled={isReadOnly}
                    >
                        <Star
                            className="h-6 w-6 transition-colors"
                            fill={ratingValue <= (hover || rating) ? '#FBBF24' : 'none'}
                            stroke={ratingValue <= (hover || rating) ? '#FBBF24' : 'currentColor'}
                        />
                    </button>
                );
            })}
        </div>
    );
}

const CourseReviewForm = ({ courseId, tenantId }: { courseId: string; tenantId: string }) => {
    const [user, loading] = useAuthState(auth);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [rating, setRating] = useState(0);

    const [state, formAction] = useActionState(submitReview, { success: false });

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Sucesso!' : 'Erro!',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                formRef.current?.reset();
                setRating(0);
                // Note: In a real app, you'd likely trigger a re-fetch of reviews here.
            }
        }
    }, [state, toast]);

    if(loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

    if(!user) return (
        <div className='p-4 border rounded-lg text-center'>
            <p className='text-sm text-muted-foreground'>Você precisa estar logado para avaliar este curso.</p>
        </div>
    );

    return (
        <form ref={formRef} action={formAction} className="space-y-4 p-4 border rounded-lg">
             <h3 className="font-headline text-xl font-bold">Deixe sua avaliação</h3>
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="tenantId" value={tenantId} />
            <input type="hidden" name="userId" value={user.uid} />
            <input type="hidden" name="userName" value={user.displayName ?? 'Aluno Anônimo'} />
            <input type="hidden" name="userAvatar" value={user.photoURL ?? ''} />
            <input type="hidden" name="rating" value={rating} />
            
            <div>
                <label className="block mb-2 font-medium">Sua nota:</label>
                <StarRating rating={rating} setRating={setRating} />
                 {state?.issues?.some(issue => issue.includes('rating')) && <p className="text-red-500 text-sm mt-1">Por favor, selecione uma nota.</p>}
            </div>
            <div>
                <label htmlFor="comment" className="block mb-2 font-medium">Seu comentário:</label>
                <Textarea id="comment" name="comment" placeholder="Descreva sua experiência com o curso..." rows={5} required />
                 {state?.issues?.filter(issue => !issue.includes('rating')).map(issue => <p key={issue} className="text-red-500 text-sm mt-1">{issue}</p>)}
            </div>
            <ReviewSubmitButton />
        </form>
    )
}

export default function CourseReviews({ initialReviews, courseId, tenantId, allowReview }: CourseReviewsProps) {
    const [reviews] = useState(initialReviews);

    return (
        <section className="py-12 md:py-20 border-t">
            <div className="container max-w-4xl">
                <h2 className="font-headline text-3xl font-bold mb-8">Avaliações dos Alunos</h2>
                <div className="space-y-8">
                    {allowReview && (
                        <CourseReviewForm courseId={courseId} tenantId={tenantId} />
                    )}

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
                                   <StarRating rating={review.rating} />
                                </div>
                                <p className="mt-2 text-muted-foreground">{review.comment}</p>
                            </div>
                       </div>
                    )) : (
                        <div className="p-8 border-2 border-dashed rounded-lg text-center bg-muted/50">
                            <p className="text-muted-foreground">Este curso ainda não tem avaliações. Seja o primeiro a avaliar!</p>
                        </div>
                    )}
               </div>
            </div>
        </section>
    )
}
