'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Search, Star } from "lucide-react";

interface Course {
    id: number;
    title: string;
    category: string;
    price: string;
    imageUrl: string;
    rating: number;
    students: number;
    dataAiHint: string;
}

interface CoursesClientContentProps {
  allCourses: Course[];
}

const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        <CardHeader className="p-0">
            <div className="relative aspect-video w-full">
                <Image src={course.imageUrl} alt={course.title} layout="fill" objectFit="cover" data-ai-hint={course.dataAiHint} />
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <Badge variant="secondary">{course.category}</Badge>
                <div className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{course.rating}</span>
                </div>
            </div>
            <h3 className="font-headline text-lg font-semibold flex-1">{course.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{course.students.toLocaleString('pt-BR')} alunos</p>
        </CardContent>
        <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
            <span className="text-xl font-bold text-primary">{course.price}</span>
            <Button size="sm">Ver Curso</Button>
        </CardFooter>
    </Card>
);

export default function CoursesClientContent({ allCourses }: CoursesClientContentProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCourses = allCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
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