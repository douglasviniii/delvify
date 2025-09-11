

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Search, Star } from "lucide-react";
import type { Course, Category } from '@/lib/courses';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExploreClientContentProps {
  allCourses: Course[];
  allCategories: Category[];
}

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
        <Link href={`/student/courses/${course.id}`} className="flex">
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
                    <Badge variant="outline" className="mb-2 w-fit">{course.category}</Badge>
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
                    {displayPrice()}
                    <Button size="sm">Ver Curso</Button>
                </CardFooter>
            </Card>
        </Link>
    )
};

export default function ExploreClientContent({ allCourses, allCategories }: ExploreClientContentProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const filteredCourses = allCourses.filter(course => {
        const matchesSearch = (course.title?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    return (
         <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl hidden sm:block">Explore Nossos Cursos</h1>
                <p className="mt-4 text-lg text-muted-foreground hidden sm:block">
                    Acelere sua carreira com nossos cursos desenvolvidos por especialistas do mercado.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="relative w-full max-w-lg">
                        <Input 
                            placeholder="O que você quer aprender hoje?" 
                            className="h-12 text-md pl-12 pr-4 rounded-full shadow-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                     <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[280px] h-12 rounded-full shadow-lg text-md">
                            <SelectValue placeholder="Filtrar por categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Categorias</SelectItem>
                            {allCategories.map(category => (
                                <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    <p className="text-muted-foreground mt-2">Tente uma busca ou filtro diferente.</p>
                </div>
            )}
        </div>
    );
}
