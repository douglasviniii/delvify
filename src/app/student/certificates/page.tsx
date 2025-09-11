
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { getPurchasedCourses, getPurchasedCourseDetails } from '@/lib/courses';
import type { Course, PurchasedCourseInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardFooter, CardDescription, CardTitle } from '@/components/ui/card';
import { Loader2, Award, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This logic now accepts a string date
const isCertificateAvailable = (course: Course, purchaseDateStr: string | null): boolean => {
    if (!purchaseDateStr) return false;
    const purchaseDate = new Date(purchaseDateStr);

    const isFree = parseFloat(course.price.replace(',', '.')) === 0;
    const hoursRequired = course.durationHours || 0;
    const now = new Date();
    const elapsedTimeInHours = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60);

    // TODO: Add quiz completion logic here
    return elapsedTimeInHours >= hoursRequired;
};


const CompletedCourseCard = ({ course }: { course: Course }) => {
    return (
        <Card className="flex flex-col shadow-md">
            <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.category}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href={`/student/certificates/${course.id}`}>
                        <Award className="mr-2 h-4 w-4" />
                        Ver Certificado
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default function StudentCertificatesPage() {
    const [user, authLoading] = useAuthState(auth);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const fetchCoursesAndCheckEligibility = async () => {
                try {
                    const [purchasedCourses, purchasedDetails] = await Promise.all([
                        getPurchasedCourses(user.uid),
                        getPurchasedCourseDetails(user.uid)
                    ]);
                    
                    const eligibleCourses = purchasedCourses.filter(course => {
                        const purchaseInfo = purchasedDetails[course.id];
                        return isCertificateAvailable(course, purchaseInfo?.purchasedAt || null);
                    });
                    
                    setCourses(eligibleCourses);
                } catch (err) {
                    console.error("Failed to load or check courses", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCoursesAndCheckEligibility();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    if (isLoading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Meus Certificados</h1>
                <p className="text-muted-foreground">Aqui estão os certificados dos cursos que você concluiu e cumpriu os requisitos.</p>
            </div>
            
            {courses.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map(course => (
                        <CompletedCourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <div className="text-center">
                        <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mt-4">Nenhum certificado disponível.</h2>
                        <p className="text-muted-foreground mt-2">
                            Conclua seus cursos e aguarde o prazo para emitir seus certificados.
                        </p>
                         <Button asChild className="mt-4" variant="outline">
                            <Link href="/student/courses">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Ir para Meus Cursos
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
