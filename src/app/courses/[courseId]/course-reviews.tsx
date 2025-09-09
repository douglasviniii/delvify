
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import type { Review } from '@/lib/courses';

interface CourseReviewsProps {
    initialReviews: Review[];
}

export default function CourseReviews({ initialReviews }: CourseReviewsProps) {
    const [reviews] = useState(initialReviews);

    return (
        <section className="py-12 md:py-20 border-t">
            <div className="container">
                <h2 className="font-headline text-3xl font-bold mb-8">Avaliações dos Alunos</h2>
                <div className="space-y-8">
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
        </section>
    )
}
