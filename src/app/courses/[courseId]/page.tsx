
'use client';

import { notFound, useRouter } from 'next/navigation';
import { getCourseById } from '@/lib/courses';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Star, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import type { Course } from '@/lib/courses';
import type { GlobalSettings } from '@/lib/settings';


// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

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


const CourseReviews = () => {
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

export default function CourseLandingPage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    const [course, setCourse] = useState<Course | null>(null);
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            getCourseById(TENANT_ID_WITH_COURSES, courseId),
            getGlobalSettingsForTenant(TENANT_ID_WITH_COURSES)
        ]).then(([courseData, settingsData]) => {
            if (!courseData || courseData.status !== 'published') {
                notFound();
                return;
            }
            setCourse(courseData);
            setSettings(settingsData);
        }).catch(err => {
            console.error(err);
            notFound();
        }).finally(() => {
            setIsLoading(false);
        });
    }, [courseId, router]);


    if (isLoading || !course || !settings) {
        return (
            <div className="flex h-screen items-center justify-center">
                {/* Você pode adicionar um componente de esqueleto/loading aqui */}
                Carregando...
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader settings={settings} />
            <main className="flex-1">
                <div className="bg-muted/30">
                    <div className="container py-12 md:py-20">
                       <div className="grid md:grid-cols-2 gap-12 items-start">
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                               <Image src={course.coverImageUrl} alt={course.title} layout="fill" objectFit="cover" />
                            </div>
                            <div className="space-y-6">
                                <Badge variant="outline">{course.category}</Badge>
                                <h1 className="font-headline text-4xl font-bold">{course.title}</h1>
                                <p className="text-lg text-muted-foreground">{course.description}</p>
                                 <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-5 h-5" />
                                    <Star className="w-5 h-5" />
                                    <Star className="w-5 h-5" />
                                    <Star className="w-5 h-5" />
                                    <Star className="w-5 h-5" />
                                    <span className="text-sm text-muted-foreground ml-1">(0 avaliações)</span>
                                </div>
                                <div className="text-3xl font-bold text-primary">
                                    {course.promotionalPrice && course.promotionalPrice !== course.price ? (
                                        <span className='flex items-center gap-4'>
                                            <span className="text-lg line-through text-muted-foreground">R$ {course.price}</span> R$ {course.promotionalPrice}
                                        </span>
                                    ) : `R$ ${course.price}`}
                                </div>
                                <Button size="lg" className="w-full text-lg h-12">
                                    Comprar Agora
                                </Button>
                            </div>
                       </div>
                    </div>
                </div>
                <CourseReviews />
            </main>
            <MainFooter />
        </div>
    );
}
