
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import type { Course, Module } from '@/lib/courses';
import { CheckCircle, Circle, FileText, PlayCircle, Notebook, Send, ArrowLeft, ArrowRight, Star as StarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { submitReview } from '@/app/courses/[courseId]/actions'; // Re-using the same server action
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';


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
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none"
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


export default function CourseViewer({ course, modules }: { course: Course; modules: Module[] }) {
    const [activeModule, setActiveModule] = useState<Module | null>(modules.length > 0 ? modules[0] : null);
    const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

    const activeModuleIndex = modules.findIndex(m => m.id === activeModule?.id);

    const handleNavigate = (direction: 'next' | 'prev') => {
        if (!activeModule) return;

        // Mark current module as completed when navigating away
        setCompletedModules(prev => new Set(prev).add(activeModule.id));

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
            // Use Google Docs viewer to embed the PDF and avoid cross-origin issues
            const pdfUrl = `https://docs.google.com/gview?url=${encodeURIComponent(activeModule.contentUrl)}&embedded=true`;
            return (
                <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title={activeModule.title}
                    allowFullScreen
                />
            );
        }

        if (course.contentType === 'video') {
            // Simple embed for YouTube, Vimeo, etc. or direct video play
            if (activeModule.contentUrl.includes('youtube.com') || activeModule.contentUrl.includes('youtu.be')) {
                 const videoId = activeModule.contentUrl.split('v=')[1]?.split('&')[0] || activeModule.contentUrl.split('/').pop();
                 return <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full border-0" title={activeModule.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
            }
             if (activeModule.contentUrl.includes('vimeo.com')) {
                 const videoId = activeModule.contentUrl.split('/').pop();
                 return <iframe src={`https://player.vimeo.com/video/${videoId}`} className="w-full h-full border-0" title={activeModule.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>;
            }

            return (
                <video
                    src={activeModule.contentUrl}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-contain"
                >
                    Seu navegador não suporta a tag de vídeo.
                </video>
            );
        }

        return <p>Formato de conteúdo não suportado.</p>
    }

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)]">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-slate-900 text-white">
                <div className="flex-1 relative aspect-video">
                    {renderContent()}
                </div>
                 <div className="p-4 bg-slate-800 flex justify-between items-center">
                    <Button onClick={() => handleNavigate('prev')} disabled={activeModuleIndex <= 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Episódio Anterior
                    </Button>
                     <div className="text-center">
                        <h3 className="font-bold text-lg">{activeModule?.title}</h3>
                        <p className="text-sm text-slate-300">{activeModuleIndex + 1} de {modules.length}</p>
                    </div>
                    <Button onClick={() => handleNavigate('next')} disabled={activeModuleIndex >= modules.length - 1}>
                        Próximo Episódio
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Sidebar with modules and notes */}
            <aside className="w-full md:w-96 border-l flex flex-col">
                <div className='p-4'>
                    <h2 className="text-xl font-bold">{course.title}</h2>
                    <p className="text-sm text-muted-foreground">Progresso: {completedModules.size} / {modules.length} aulas</p>
                </div>
                <Separator />
                <Tabs defaultValue="episodes" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-3 rounded-none">
                        <TabsTrigger value="episodes">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Episódios
                        </TabsTrigger>
                        <TabsTrigger value="tools">
                             <Notebook className="mr-2 h-4 w-4" />
                            Ferramentas
                        </TabsTrigger>
                         <TabsTrigger value="review">
                             <StarIcon className="mr-2 h-4 w-4" />
                            Avaliar
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="episodes" className="flex-1 overflow-auto">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-2">
                                {modules.map((module, index) => (
                                    <button
                                        key={module.id}
                                        onClick={() => setActiveModule(module)}
                                        className={`w-full text-left p-4 rounded-lg flex items-center gap-4 transition-colors ${activeModule?.id === module.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                                    >
                                        {completedModules.has(module.id) ? 
                                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                                            <Circle className="h-5 w-5 text-muted-foreground" />
                                        }
                                        <div className="flex-1">
                                            <p className="font-semibold">{index + 1}. {module.title}</p>
                                            <span className="text-xs text-muted-foreground">
                                                {course.contentType === 'video' ? 'Vídeo' : 'PDF'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="tools" className="flex-1 overflow-auto p-4">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Anotações do Episódio</h3>
                                <Textarea placeholder="Suas anotações privadas... visíveis somente para você." className="min-h-[150px]" />
                                <Button size="sm" className="mt-2">Salvar Anotação</Button>
                            </div>
                            <Separator />
                             <div>
                                <h3 className="font-semibold mb-2">Pergunte ao Professor</h3>
                                <Textarea placeholder="Digite sua dúvida sobre este episódio..." />
                                <Button size="sm" className="mt-2">
                                    <Send className="mr-2 h-4 w-4" /> Enviar Pergunta
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                     <TabsContent value="review" className="flex-1 overflow-auto p-4">
                        <CourseReviewForm courseId={course.id} tenantId={course.tenantId} />
                    </TabsContent>
                </Tabs>
            </aside>
        </div>
    );
}
