
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Search, Star } from "lucide-react";
import type { Course } from '@/lib/courses';


interface CoursesClientContentProps {
  allCourses: Course[];
}

const CourseCard = ({ course }: { course: Course }) => (
    <Link href={`/courses/${course.id}`} className="flex">
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col w-full group">
            <CardHeader className="p-0">
                <div className="relative aspect-video w-full">
                    <Image src={course.coverImageUrl} alt={course.title} layout="fill" objectFit="cover" />
                     {course.tag && (
                        <Badge variant="secondary" className="absolute top-2 right-2">{course.tag}</Badge>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-headline text-lg font-semibold flex-1 leading-tight group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
                 <div className="flex items-center gap-1 text-yellow-500 mt-4">
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                    <Star className="w-4 h-4" />
                    <span className="text-xs text-muted-foreground ml-1">(0)</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/20 flex justify-between items-center">
                 <div className="text-lg font-bold text-primary">
                    {course.promotionalPrice && course.promotionalPrice !== course.price ? (
                        <span>
                            <span className="text-sm line-through text-muted-foreground mr-2">R$ {course.price}</span> R$ {course.promotionalPrice}
                        </span>
                    ) : `R$ ${course.price}`}
                </div>
                <Button size="sm">Ver Curso</Button>
            </CardFooter>
        </Card>
    </Link>
);

export default function CoursesClientContent({ allCourses }: CoursesClientContentProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCourses = allCourses.filter(course => 
        (course.title?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    );
    
    return (
         <section className="py-12 md:py-20">
            <div className="container px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Nossos Cursos</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Acelere sua carreira com nossos cursos desenvolvidos por especialistas do mercado.
                    </p>
                    <div className="mt-8 relative max-w-2xl mx-auto">
                        <Input 
                            placeholder="O que você quer aprender hoje?" 
                            className="h-14 text-lg pl-14 pr-4 rounded-full shadow-lg border-2 border-transparent focus:border-primary transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                    </div>
                </div>

                {filteredCourses.length > 0 ? (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border rounded-lg">
                        <h2 className="text-2xl font-semibold">Nenhum curso encontrado.</h2>
                        <p className="text-muted-foreground mt-2">Tente uma busca diferente ou verifique novamente mais tarde.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
