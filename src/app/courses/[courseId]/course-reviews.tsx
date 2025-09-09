
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Mock data for reviews
const mockReviews = [
  {
    id: 1,
    author: 'Ana Silva',
    avatarUrl: 'https://picsum.photos/id/1011/48/48',
    rating: 5,
    comment: 'Curso fantástico! O conteúdo é muito bem explicado e os exemplos são práticos. Recomendo fortemente!',
    date: '2 dias atrás'
  },
  {
    id: 2,
    author: 'Carlos Souza',
    avatarUrl: 'https://picsum.photos/id/1012/48/48',
    rating: 4,
    comment: 'Gostei bastante do curso, aprendi muito. Apenas senti falta de mais exercícios práticos no último módulo.',
    date: '1 semana atrás'
  },
   {
    id: 3,
    author: 'Juliana Pereira',
    avatarUrl: null,
    rating: 5,
    comment: 'Didática impecável e suporte rápido. Um dos melhores cursos que já fiz na área.',
    date: '3 semanas atrás'
  }
];


export default function CourseReviews() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <section className="py-12 md:py-20 border-t">
            <div className="container">
                <h2 className="font-headline text-3xl font-bold mb-8">Avaliações dos Alunos</h2>
                <div className="grid md:grid-cols-3 gap-8">
                   {/* Review Submission Form */}
                   <div className="md:col-span-1">
                        <h3 className="text-xl font-semibold mb-4">Deixe sua avaliação</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 font-medium">Sua nota:</p>
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
                            </div>
                             <div>
                                <label htmlFor="comment" className="block mb-2 font-medium">Seu comentário:</label>
                                <Textarea id="comment" placeholder="Descreva sua experiência com o curso..." rows={5} />
                            </div>
                            <Button className="w-full">Enviar Avaliação</Button>
                        </div>
                   </div>
                   {/* Reviews List */}
                   <div className="md:col-span-2 space-y-6">
                        {mockReviews.map((review) => (
                           <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={review.avatarUrl ?? undefined} />
                                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">{review.author}</h4>
                                        <p className="text-xs text-muted-foreground">{review.date}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                             <Star key={i} className="h-4 w-4" fill={i < review.rating ? '#FBBF24' : 'none'} stroke={i < review.rating ? '#FBBF24' : 'currentColor'}/>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-muted-foreground">{review.comment}</p>
                                </div>
                           </div>
                        ))}
                   </div>
                </div>
            </div>
        </section>
    )
}
