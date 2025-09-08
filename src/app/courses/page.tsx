

'use client';

import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Search, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { getGlobalSettingsForTenant } from "@/lib/settings";
import type { GlobalSettings } from "@/lib/settings";


// This is the main tenant ID for the public-facing website.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

// Mock Data for Courses - should be consistent with home page
const allMockCourses = [
    { id: 1, title: 'Desenvolvimento Web Moderno com React', category: 'DEV', price: 'R$ 499', imageUrl: 'https://picsum.photos/300/200?random=1', rating: 4.8, students: 1250, dataAiHint: "web development" },
    { id: 2, title: 'Marketing Digital para Iniciantes', category: 'MKT', price: 'R$ 299', imageUrl: 'https://picsum.photos/300/200?random=2', rating: 4.5, students: 890, dataAiHint: "digital marketing" },
    { id: 3, title: 'UI/UX Design Essencial', category: 'DESIGN', price: 'R$ 399', imageUrl: 'https://picsum.photos/300/200?random=3', rating: 4.9, students: 2100, dataAiHint: "ui ux design" },
    { id: 4, title: 'Gestão de Projetos com Metodologias Ágeis', category: 'GESTÃO', price: 'R$ 599', imageUrl: 'https://picsum.photos/300/200?random=4', rating: 4.7, students: 980, dataAiHint: "project management" },
    { id: 5, title: 'Introdução à Inteligência Artificial', category: 'IA', price: 'R$ 699', imageUrl: 'https://picsum.photos/300/200?random=5', rating: 4.9, students: 3500, dataAiHint: "artificial intelligence" },
    { id: 6, title: 'Fotografia Digital para Redes Sociais', category: 'FOTO', price: 'R$ 249', imageUrl: 'https://picsum.photos/300/200?random=6', rating: 4.6, students: 750, dataAiHint: "photography" },
    { id: 7, title: 'Finanças Pessoais e Investimentos', category: 'FINANÇAS', price: 'R$ 349', imageUrl: 'https://picsum.photos/300/200?random=7', rating: 4.8, students: 1800, dataAiHint: "personal finance" },
    { id: 8, title: 'Desenvolvimento de Apps com Flutter', category: 'DEV', price: 'R$ 549', imageUrl: 'https://picsum.photos/300/200?random=8', rating: 4.7, students: 1100, dataAiHint: "mobile development" },
    { id: 9, title: 'Copywriting e Escrita Persuasiva', category: 'MKT', price: 'R$ 399', imageUrl: 'https://picsum.photos/300/200?random=9', rating: 4.8, students: 1500, dataAiHint: "copywriting" },
    { id: 10, title: 'Design de Sistemas para Entrevistas', category: 'DEV', price: 'R$ 799', imageUrl: 'https://picsum.photos/300/200?random=10', rating: 4.9, students: 4200, dataAiHint: "system design" },
    { id: 11, title: 'Edição de Vídeo com DaVinci Resolve', category: 'VIDEO', price: 'R$ 449', imageUrl: 'https://picsum.photos/300/200?random=11', rating: 4.7, students: 1300, dataAiHint: "video editing" },
    { id: 12, title: 'Análise de Dados com Python e Pandas', category: 'DADOS', price: 'R$ 599', imageUrl: 'https://picsum.photos/300/200?random=12', rating: 4.8, students: 2800, dataAiHint: "data analysis" },
];

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

export default function CoursesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [settings, setSettings] = useState<GlobalSettings | null>(null);

    useEffect(() => {
        getGlobalSettingsForTenant(MAIN_TENANT_ID).then(setSettings);
    }, []);

    const filteredCourses = allMockCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!settings) {
        return <div>Carregando...</div>; // Ou um componente de esqueleto
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader settings={settings} />
            <main className="flex-1">
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
            </main>
            <MainFooter />
        </div>
    );
}
