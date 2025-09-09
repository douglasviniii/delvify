

import { notFound } from 'next/navigation';
import { getCourseById, getCourseReviews } from '@/lib/courses';
import CourseReviews from '@/app/courses/[courseId]/course-reviews';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, PlayCircle } from 'lucide-react';
import Link from 'next/link';

// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function StudentCourseDetailsPage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    
    // TODO: Adicionar lógica para verificar se o usuário já comprou este curso.
    const isPurchased = false; // Placeholder
    
    const [course, reviews] = await Promise.all([
        getCourseById(TENANT_ID_WITH_COURSES, courseId),
        getCourseReviews(TENANT_ID_WITH_COURSES, courseId)
    ]);
    
    if (!course) {
        notFound();
    }
    
    return (
        <div className="flex-1 space-y-8">
            <div className="bg-muted/30 -m-8 p-8">
                <div className="container mx-auto max-w-7xl">
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
                                <span className="text-sm text-muted-foreground ml-1">({reviews.length} avaliações)</span>
                            </div>
                            <div className="text-3xl font-bold text-primary">
                                {course.promotionalPrice && course.promotionalPrice !== course.price ? (
                                    <span className='flex items-center gap-4'>
                                        <span className="text-lg line-through text-muted-foreground">R$ {course.price}</span> R$ {course.promotionalPrice}
                                    </span>
                                ) : `R$ ${course.price}`}
                            </div>
                            <Button size="lg" className="w-full text-lg h-12" asChild>
                                <Link href={`/student/courses/${courseId}/watch`}>
                                     <PlayCircle className='mr-2 h-5 w-5' />
                                     {isPurchased ? "Continuar Curso" : "Comprar Agora"}
                                </Link>
                            </Button>
                        </div>
                   </div>
                </div>
            </div>
            <div className='container mx-auto max-w-7xl'>
                 <CourseReviews 
                    initialReviews={reviews} 
                    courseId={course.id}
                    tenantId={course.tenantId}
                    allowReview={true} // Permitir avaliação na página de detalhes do aluno
                />
            </div>
        </div>
    );
}

