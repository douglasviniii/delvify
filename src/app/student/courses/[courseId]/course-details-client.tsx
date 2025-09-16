
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Course, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, PlayCircle, Loader2, ArrowLeft } from 'lucide-react';
import CourseReviews from '@/app/courses/[courseId]/course-reviews';
import { createCheckoutSession, enrollInFreeCourse } from './actions';

interface CourseDetailsClientProps {
    course: Course;
    initialReviews: Review[];
    initialIsPurchased: boolean;
    user: {
        uid: string;
        email: string;
        displayName: string;
    };
}

export default function CourseDetailsClient({ course, initialReviews, initialIsPurchased, user }: CourseDetailsClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isPurchased, setIsPurchased] = useState(initialIsPurchased);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setIsPurchased(initialIsPurchased);
    }, [initialIsPurchased]);

    const handlePurchaseOrEnroll = () => {
        if (!course || !user) return;
        
        startTransition(async () => {
            const isFree = parseFloat(course.price.replace(',', '.')) === 0;

            if (isFree) {
                const response = await enrollInFreeCourse(user.uid, course);
                if(response.success) {
                    toast({ title: "Inscrição Realizada!", description: "Você já pode começar a assistir." });
                    setIsPurchased(true);
                } else {
                    toast({ title: "Erro na Inscrição", description: response.message, variant: "destructive" });
                }
            } else {
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
                                <span className="text-sm text-muted-foreground ml-1">({initialReviews.length} avaliações)</span>
                            </div>
                            {displayPrice()}
                            
                            {isPurchased ? (
                                 <Button size="lg" className="w-full text-lg h-12" asChild>
                                    <Link href={`/student/courses/${course.id}/watch`}>
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
                    initialReviews={initialReviews} 
                    courseId={course.id}
                    tenantId={course.tenantId}
                    allowReview={isPurchased}
                />
            </div>
        </div>
    );
}
