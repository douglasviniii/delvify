

import { notFound } from 'next/navigation';
import { getCourseById, getCourseReviews, type Review } from '@/lib/courses';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import CourseReviews from './course-reviews';
import Link from 'next/link';


// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';


export default async function CourseLandingPage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    
    const [course, reviews] = await Promise.all([
        getCourseById(TENANT_ID_WITH_COURSES, courseId),
        getCourseReviews(TENANT_ID_WITH_COURSES, courseId)
    ]);
    
    if (!course || course.status !== 'published') {
        notFound();
    }

    const isFree = parseFloat(course.price.replace(',', '.')) === 0;

    const displayPrice = () => {
        if (isFree) return <span className="text-3xl font-bold text-green-600">Gratuito</span>;

        if (course.promotionalPrice && course.promotionalPrice !== course.price) {
            return (
                <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-bold text-primary">R$ {course.promotionalPrice}</span>
                    <span className="text-xl line-through text-muted-foreground">R$ {course.price}</span>
                </div>
            )
        }
        
        return <span className="text-3xl font-bold text-primary">R$ {course.price}</span>
    }
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader />
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
                                    <span className="text-sm text-muted-foreground ml-1">({reviews.length} avaliações)</span>
                                </div>
                                {displayPrice()}
                                <Button size="lg" className="w-full text-lg h-12" asChild>
                                    <Link href="/login">{isFree ? 'Acessar Gratuitamente' : 'Comprar Agora'}</Link>
                                </Button>
                            </div>
                       </div>
                    </div>
                </div>
                <CourseReviews 
                    initialReviews={reviews} 
                    courseId={course.id}
                    tenantId={TENANT_ID_WITH_COURSES}
                />
            </main>
            <MainFooter />
        </div>
    );
}
