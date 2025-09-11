
'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { getCourseById, getCourseReviews, hasPurchasedCourse } from '@/lib/courses';
import CourseReviews from '@/app/courses/[courseId]/course-reviews';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, PlayCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState, useTransition } from 'react';
import type { Course, Review } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession, enrollInFreeCourse } from './actions';


const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default function StudentCourseDetailsPage() {
    const params = useParams();
    const courseId = params.courseId as string;
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

            if (user && courseId) {
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

        if (!authLoading) {
           fetchData();
        }
    }, [user, authLoading, courseId, toast, router]);

    const handlePurchaseOrEnroll = () => {
        if (!course || !user) return;
        
        startTransition(async () => {
            const isFree = parseFloat(course.price.replace(',', '.')) === 0;

            if (isFree) {
                // Free course enrollment
                const response = await enrollInFreeCourse(user.uid, course);
                if(response.success) {
                    toast({ title: "Inscrição Realizada!", description: "Você já pode começar a assistir." });
                    setIsPurchased(true); // Update state to show "Assistir" button
                } else {
                    toast({ title: "Erro na Inscrição", description: response.message, variant: "destructive" });
                }
            } else {
                // Paid course checkout
                const response = await createCheckoutSession(course, user.uid, user.email!);

                if (response.url) {
                    router.push(response.url);
                } else {
                    toast({
                        title: "Erro no Checkout",
                        description: response.error || "Não foi possível iniciar o processo de pagamento. Tente novamente.",
                        variant: "destructive"
                    });
                }
            }
        });
    }

    if (isLoading || authLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!course) {
        return notFound();
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
        <div className="flex-1 space-y-8">
            <Button asChild variant="outline">
                <Link href="/student/courses">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Meus Cursos
                </Link>
            </Button>
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
                            {displayPrice()}
                            
                            {isPurchased ? (
                                 <Button size="lg" className="w-full text-lg h-12" asChild>
                                    <Link href={`/student/courses/${courseId}/watch`}>
                                         <PlayCircle className='mr-2 h-5 w-5' />
                                         Assistir Curso
                                    </Link>
                                </Button>
                            ) : (
                                <Button size="lg" className="w-full text-lg h-12" onClick={handlePurchaseOrEnroll} disabled={isPending}>
                                     {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlayCircle className='mr-2 h-5 w-5' />}
                                     {isPending ? "Processando..." : (isFree ? 'Inscrever-se Gratuitamente' : 'Comprar Agora')}
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
