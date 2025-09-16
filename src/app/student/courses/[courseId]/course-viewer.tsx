
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import type { Course, Module } from '@/lib/types';
import { CheckCircle, Circle, FileText, PlayCircle, Notebook, Send, ArrowLeft, ArrowRight, Star as StarIcon, Menu, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { submitReview } from './actions';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

function ReviewSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enviar Avaliação
        </Button>
    )
}

function StarRating({ rating, setRating }: { rating: number, setRating?: (r: number) => void }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setRating?.(ratingValue)}
                        onMouseEnter={() => setRating && setHover(ratingValue)}
                        onMouseLeave={() => setRating && setHover(0)}
                        className="focus:outline-none disabled:cursor-default"
                        disabled={!setRating}
                    >
                        <StarIcon
                            className="h-8 w-8 transition-colors"
                            fill={ratingValue <= (hover || rating) ? '#FBBF24' : 'none'}
                            stroke={ratingValue <= (hover || rating) ? '#FBBF24' : 'currentColor'}
                        />
                    </button>
                );
            })}
        </div>
    );
}

const CourseReviewForm = ({ courseId, tenantId }: { courseId: string; tenantId: string }) => {
    const [user, loading] = useAuthState(auth);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [rating, setRating] = useState(0);

    const [state, formAction] = useActionState(submitReview, { success: false });

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? 'Sucesso!' : 'Erro!',
                description: state.message,
                variant: state.success ? 'default' : 'destructive',
            });
            if (state.success) {
                formRef.current?.reset();
                setRating(0);
            }
        }
    }, [state, toast]);

    if(loading) return <Loader2 className="animate-spin" />;

    if(!user) return <p className='text-sm text-muted-foreground'>Você precisa estar logado para avaliar.</p>

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="tenantId" value={tenantId} />
            <input type="hidden" name="userId" value={user.uid} />
            <input type="hidden" name="userName" value={user.displayName ?? 'Aluno Anônimo'} />
            <input type="hidden" name="userAvatar" value={user.photoURL ?? ''} />
            <input type="hidden" name="rating" value={rating} />
            
            <div>
                <label className="block mb-2 font-medium">Sua nota:</label>
                <StarRating rating={rating} setRating={setRating} />
            </div>
            <div>
                <label htmlFor="comment" className="block mb-2 font-medium">Seu comentário:</label>
                <Textarea id="comment" name="comment" placeholder="Descreva sua experiência com o curso..." rows={5} required />
                 {state?.issues?.map(issue => <p key={issue} className="text-red-500 text-sm mt-1">{issue}</p>)}
            </div>
            <ReviewSubmitButton />
        </form>
    )
}

const Sidebar = ({
    isOpen,
    course,
    modules,
    activeModule,
    setActiveModule,
    completedModules,
    toggleCompletion
}: {
    isOpen: boolean;
    course: Course;
    modules: Module[];
    activeModule: Module | null;
    setActiveModule: (module: Module) => void;
    completedModules: Set<string>;
    toggleCompletion: (moduleId: string) => void;
}) => {
    const progress = (completedModules.size / modules.length) * 100;
    
    return (
        <aside className={cn(
            "absolute inset-y-0 left-0 z-20 flex-col w-80 bg-card border-r transform transition-transform duration-300 md:relative md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
             <div className="p-4 border-b">
                <Link href={`/student/courses/${course.id}`}>
                    <h2 className="text-lg font-bold truncate hover:text-primary">{course.title}</h2>
                </Link>
                <div className="flex items-center gap-2 mt-2">
                    <Progress value={progress} className="h-2" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{Math.round(progress)}%</span>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {modules.map((module, index) => (
                        <button
                            key={module.id}
                            onClick={() => setActiveModule(module)}
                            className={cn(
                                "w-full text-left p-3 rounded-md flex items-start gap-3 transition-colors text-sm",
                                activeModule?.id === module.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
                            )}
                        >
                             <div onClick={(e) => { e.stopPropagation(); toggleCompletion(module.id); }} className="pt-0.5">
                                {completedModules.has(module.id) ? 
                                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                }
                            </div>
                            <div className="flex-1">
                                <p className="leading-tight">{index + 1}. {module.title}</p>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    {course.contentType === 'video' ? <PlayCircle className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                                    {course.contentType === 'video' ? 'Vídeo' : 'Slide'}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </aside>
    );
};

export default function CourseViewer({ course, modules }: { course: Course; modules: Module[] }) {
    const [activeModule, setActiveModule] = useState<Module | null>(modules.length > 0 ? modules[0] : null);
    const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const activeModuleIndex = modules.findIndex(m => m.id === activeModule?.id);

    const toggleCompletion = (moduleId: string) => {
        setCompletedModules(prev => {
            const newSet = new Set(prev);
            if(newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        })
    }

    const handleNavigate = (direction: 'next' | 'prev') => {
        if (!activeModule) return;

        const newIndex = direction === 'next' ? activeModuleIndex + 1 : activeModuleIndex - 1;
        if (newIndex >= 0 && newIndex < modules.length) {
            setActiveModule(modules[newIndex]);
        }
    }
    
    const renderContent = () => {
        if (!activeModule) {
            return (
                <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                    <p>Selecione um episódio para começar.</p>
                </div>
            );
        }

        if (course.contentType === 'pdf') {
            return (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <Image
                        key={activeModule.id}
                        src={activeModule.contentUrl}
                        alt={activeModule.title}
                        width={1280}
                        height={720}
                        className="object-contain max-w-full max-h-full"
                    />
                </div>
            );
        }

        if (course.contentType === 'video') {
            return (
                 <video
                    key={activeModule.id}
                    src={activeModule.contentUrl}
                    controls
                    autoPlay
                    controlsList="nodownload"
                    className="w-full h-full object-contain bg-black"
                >
                    Seu navegador não suporta a tag de vídeo.
                </video>
            );
        }

        return <p>Formato de conteúdo não suportado.</p>
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar 
                isOpen={isSidebarOpen}
                course={course}
                modules={modules}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                completedModules={completedModules}
                toggleCompletion={toggleCompletion}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between p-2 border-b bg-card h-14">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                        <h1 className="font-semibold text-lg truncate hidden sm:block">{activeModule?.title}</h1>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleNavigate('prev')} disabled={activeModuleIndex <= 0}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Anterior
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleNavigate('next')} disabled={activeModuleIndex >= modules.length - 1}>
                            Próximo
                             <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </header>

                {/* Main Content & Tabs */}
                <main className="flex-1 flex flex-col min-h-0">
                    <div className="flex-grow aspect-video bg-muted">
                        {renderContent()}
                    </div>
                    <div className="p-4 border-t flex-shrink-0">
                         <Tabs defaultValue="description" className="w-full">
                             <TabsList>
                                <TabsTrigger value="description">Sobre a Aula</TabsTrigger>
                                <TabsTrigger value="notes">Anotações</TabsTrigger>
                                <TabsTrigger value="review">Avaliar</TabsTrigger>
                            </TabsList>
                             <TabsContent value="description" className="p-4 text-sm text-muted-foreground">
                                {activeModule?.description || "Nenhuma descrição para esta aula."}
                            </TabsContent>
                            <TabsContent value="notes">
                                <div className="space-y-4 p-4">
                                    <h3 className="font-semibold">Anotações Privadas</h3>
                                    <Textarea placeholder="Suas anotações... visíveis somente para você." className="min-h-[100px]" />
                                    <Button size="sm">Salvar Anotação</Button>
                                </div>
                            </TabsContent>
                             <TabsContent value="review">
                                 <div className="p-4">
                                    <CourseReviewForm courseId={course.id} tenantId={course.tenantId} />
                                 </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
