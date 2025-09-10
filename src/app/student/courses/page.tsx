
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getPurchasedCourses } from '@/lib/courses';
import type { Course } from '@/lib/courses';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CourseCard = ({ course }: { course: Course }) => (
    <Link href={`/student/courses/${course.id}`} className="flex">
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col w-full group">
            <CardHeader className="p-0">
                <div className="relative aspect-video w-full">
                    <Image src={course.coverImageUrl} alt={course.title} layout="fill" objectFit="cover" />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
                <Badge variant="outline" className="mb-2 w-fit">{course.category}</Badge>
                <h3 className="font-headline text-lg font-semibold flex-1 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-4">
                    <Button size="sm" className="w-full">Continuar Curso</Button>
                </p>
            </CardContent>
        </Card>
    </Link>
);


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
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} />
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
