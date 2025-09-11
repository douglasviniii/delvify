
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getPurchasedCourses } from '@/lib/courses';
import type { Course } from '@/lib/types';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, BookOpen, CheckCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CourseCard = ({ course }: { course: Course }) => {
    // Lógica de conclusão simulada: se o ID for um número par, o curso está "concluído".
    // Isso será substituído pela lógica de progresso real.
    const isCompleted = parseInt(course.id.replace(/[^0-9]/g, '').slice(-1) || "0") % 2 === 0;

    return (
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col w-full group">
            <Link href={`/student/courses/${course.id}`} className="flex flex-col flex-1">
                <CardHeader className="p-0">
                    <div className="relative aspect-video w-full">
                        <Image src={course.coverImageUrl} alt={course.title} layout="fill" objectFit="cover" />
                         {isCompleted && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Badge variant="default" className="text-sm bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Finalizado
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                    <Badge variant="outline" className="mb-2 w-fit">{course.category}</Badge>
                    <h3 className="font-headline text-lg font-semibold flex-1 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                </CardContent>
            </Link>
            <CardFooter className="p-4 bg-muted/20">
                {isCompleted ? (
                    <Button variant="secondary" className="w-full" asChild>
                        <Link href={`/student/certificates/${course.id}`}>
                            <Award className="mr-2 h-4 w-4" />
                            Ver Certificado
                        </Link>
                    </Button>
                ) : (
                    <Button className="w-full" asChild>
                        <Link href={`/student/courses/${course.id}/watch`}>
                           Continuar Curso
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};


export default function StudentCoursesPage() {
    const [user, authLoading] = useAuthState(auth);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getPurchasedCourses(user.uid)
                .then(setCourses)
                .catch(err => console.error("Failed to load purchased courses", err))
                .finally(() => setIsLoading(false));
        } else if (!authLoading) {
            setIsLoading(false); // No user, so stop loading
        }
    }, [user, authLoading]);

    const groupedCourses = courses.reduce((acc, course) => {
        const category = course.category || 'Sem Categoria';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(course);
        return acc;
    }, {} as Record<string, Course[]>);

    if (isLoading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Meus Cursos</h1>
            {courses.length > 0 ? (
                <div className="space-y-10">
                    {Object.entries(groupedCourses).map(([category, coursesInCategory]) => (
                        <section key={category}>
                            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary">{category}</h2>
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {coursesInCategory.map(course => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <div className="text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mt-4">Você ainda não possui cursos.</h2>
                        <p className="text-muted-foreground mt-2">
                            Explore nossa biblioteca de cursos e comece a aprender hoje mesmo!
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/student/explore">Explorar Cursos</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
