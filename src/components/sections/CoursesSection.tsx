
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

// Mock Data for Courses
const mockCourses = [
    { id: 1, title: 'Desenvolvimento Web Moderno com React', category: 'DEV', price: 'R$ 499', imageUrl: 'https://picsum.photos/300/200?random=1', rating: 4.8, students: 1250, dataAiHint: "web development" },
    { id: 2, title: 'Marketing Digital para Iniciantes', category: 'MKT', price: 'R$ 299', imageUrl: 'https://picsum.photos/300/200?random=2', rating: 4.5, students: 890, dataAiHint: "digital marketing" },
    { id: 3, title: 'UI/UX Design Essencial', category: 'DESIGN', price: 'R$ 399', imageUrl: 'https://picsum.photos/300/200?random=3', rating: 4.9, students: 2100, dataAiHint: "ui ux design" },
    { id: 4, title: 'Gestão de Projetos com Metodologias Ágeis', category: 'GESTÃO', price: 'R$ 599', imageUrl: 'https://picsum.photos/300/200?random=4', rating: 4.7, students: 980, dataAiHint: "project management" },
    { id: 5, title: 'Introdução à Inteligência Artificial', category: 'IA', price: 'R$ 699', imageUrl: 'https://picsum.photos/300/200?random=5', rating: 4.9, students: 3500, dataAiHint: "artificial intelligence" },
    { id: 6, title: 'Fotografia Digital para Redes Sociais', category: 'FOTO', price: 'R$ 249', imageUrl: 'https://picsum.photos/300/200?random=6', rating: 4.6, students: 750, dataAiHint: "photography" },
    { id: 7, title: 'Finanças Pessoais e Investimentos', category: 'FINANÇAS', price: 'R$ 349', imageUrl: 'https://picsum.photos/300/200?random=7', rating: 4.8, students: 1800, dataAiHint: "personal finance" },
    { id: 8, title: 'Desenvolvimento de Apps com Flutter', category: 'DEV', price: 'R$ 549', imageUrl: 'https://picsum.photos/300/200?random=8', rating: 4.7, students: 1100, dataAiHint: "mobile development" },
];

// Course Card Component
const CourseCard = ({ course }: { course: any }) => (
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

export const CoursesSection = () => (
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {mockCourses.slice(0, 8).map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
             <div className="mt-12 text-center">
                <Button asChild size="lg">
                    <Link href="/courses">Ver Todos os Cursos</Link>
                </Button>
            </div>
        </div>
    </section>
)
