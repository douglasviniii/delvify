
'use client';

import { notFound, useRouter } from 'next/navigation';
import { getCourseById, getCourseReviews, hasPurchasedCourse } from '@/lib/courses';
import CourseReviews from '@/app/courses/[courseId]/course-reviews';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState, useTransition } from 'react';
import type { Course, Review } from '@/lib/courses';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from './actions';


const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default function StudentCourseDetailsPage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isPurchased, setIsPurchased] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchData = async () => {
            if (!user && !authLoading) {
                toast({ title: "Acesso Negado", description: "Você precisa estar logado para ver os detalhes do curso.", variant: "destructive" });
                router.push('/login');
                return;
            }

            if (user) {
                setIsLoading(true);
                try {
                    const [courseData, reviewsData, purchaseData] = await Promise.all([
                        getCourseById(TENANT_ID_WITH_COURSES, courseId),
                        getCourseReviews(TENANT_ID_WITH_COURSES, courseId),
                        hasPurchasedCourse(user.uid, courseId)
                    ]);
                    
                    if (!courseData) {
                        notFound();
                        return;
                    }

                    setCourse(courseData);
                    setReviews(reviewsData);
                    setIsPurchased(purchaseData);

                } catch (error) {
                    console.error("Error fetching course details:", error);
                    toast({ title: "Erro", description: "Não foi possível carregar os detalhes do curso.", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [user, authLoading, courseId, toast, router]);

    const handlePurchase = () => {
        if (!course || !user) return;
        
        startTransition(async () => {
            try {
                await createCheckoutSession(course, user.uid, user.email!, user.displayName!);
            } catch (error) {
                console.error(error);
                toast({
                    title: "Erro no Checkout",
                    description: "Não foi possível iniciar o processo de pagamento. Tente novamente.",
                    variant: "destructive"
                });
            }
        });
    }

    if (isLoading || authLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!course) {
        return notFound();
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
                            
                            {isPurchased ? (
                                 <Button size="lg" className="w-full text-lg h-12" asChild>
                                    <Link href={`/student/courses/${courseId}/watch`}>
                                         <PlayCircle className='mr-2 h-5 w-5' />
                                         Assistir Curso
                                    </Link>
                                </Button>
                            ) : (
                                <Button size="lg" className="w-full text-lg h-12" onClick={handlePurchase} disabled={isPending}>
                                     {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlayCircle className='mr-2 h-5 w-5' />}
                                     {isPending ? "Processando..." : "Comprar Agora"}
                                </Button>
                            )}

                        </div>
                   </div>
                </div>
            </div>
            <div className='container mx-auto max-w-7xl'>
                 <CourseReviews 
                    initialReviews={reviews} 
                    courseId={course.id}
                    tenantId={course.tenantId}
                    allowReview={isPurchased}
                />
            </div>
        </div>
    );
}
