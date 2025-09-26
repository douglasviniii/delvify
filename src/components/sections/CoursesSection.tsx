
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import type { Course } from '@/lib/types';


const CourseCard = ({ course }: { course: Course }) => {
    const isFree = parseFloat(course.price.replace(',', '.')) === 0;

    const displayPrice = () => {
        if (isFree) return <span className="text-xl font-bold text-green-600">Gratuito</span>;
        
        const effectivePrice = course.promotionalPrice || course.price;
        const originalPrice = course.price;

        return (
             <div className="text-lg font-bold text-primary">
                {course.promotionalPrice && course.promotionalPrice !== course.price ? (
                    <span>
                        <span className="text-sm line-through text-muted-foreground mr-2">R$ {originalPrice}</span> R$ {effectivePrice}
                    </span>
                ) : `R$ ${originalPrice}`}
            </div>
        )
    }
    return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group">
         <Link href={`/courses/${course.id}`} className="flex flex-col flex-1">
            <CardHeader className="p-0">
                <div className="relative aspect-video w-full">
                    <Image src={course.coverImageUrl} alt={course.title} layout="fill" objectFit="cover" />
                    {course.tag && (
                        <Badge variant="secondary" className="absolute top-2 right-2">{course.tag}</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
                <Badge variant="outline" className="mb-2 w-fit">{course.category}</Badge>
                <h3 className="font-headline text-lg font-semibold flex-1 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                <div className="flex items-center gap-1 text-yellow-500 mt-4">
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                    <span className="text-xs text-muted-foreground ml-1">(0)</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/20 flex justify-between items-center z-10">
                {displayPrice()}
                <Button size="sm">Ver Curso</Button>
            </CardFooter>
        </Link>
    </Card>
)};

export const CoursesSection = ({ courses = [] }: { courses: Course[] }) => (
    <section className="py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Explore Nossos Cursos</h2>
                <p className="mt-4 text-muted-foreground">Encontre o curso perfeito para impulsionar sua carreira.</p>
                <div className="mt-6 relative">
                    <Input placeholder="Pesquise por cursos..." className="h-12 text-lg pl-12 pr-4 rounded-full shadow-md" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                </div>
            </div>
            {courses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {courses.slice(0, 8).map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border rounded-lg">
                    <h2 className="text-xl font-semibold">Nenhum curso disponível no momento.</h2>
                    <p className="text-muted-foreground mt-2">Volte em breve para conferir as novidades!</p>
                </div>
            )}
             <div className="mt-12 text-center">
                <Button asChild size="lg">
                    <Link href="/courses">Ver Todos os Cursos</Link>
                </Button>
            </div>
        </div>
    </section>
)
