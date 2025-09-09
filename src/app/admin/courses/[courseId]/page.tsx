
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, PlusCircle, Trash2, GripVertical, FileQuestion } from 'lucide-react';
import { saveCourseModules } from './actions';

const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'O título do módulo é obrigatório.'),
  contentUrl: z.string().url('A URL do conteúdo é obrigatória.'),
});

const courseModulesSchema = z.object({
  modules: z.array(moduleSchema),
});

type Course = {
  id: string;
  title: string;
  contentType: 'video' | 'pdf';
};

type Module = z.infer<typeof moduleSchema>;


export default function CourseModulesPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user] = useAuthState(auth);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  
  const form = useForm<z.infer<typeof courseModulesSchema>>({
    resolver: zodResolver(courseModulesSchema),
    defaultValues: {
      modules: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "modules",
  });

  useEffect(() => {
    if (!user || !courseId) return;

    const courseRef = doc(db, `tenants/${user.uid}/courses`, courseId);

    const getCourseData = async () => {
      try {
        const docSnap = await getDoc(courseRef);
        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
        } else {
          toast({ title: 'Erro', description: 'Curso não encontrado.', variant: 'destructive' });
          router.push('/admin/courses');
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({ title: 'Erro', description: 'Não foi possível carregar o curso.', variant: 'destructive' });
      }
    };
    
    const modulesQuery = query(collection(courseRef, 'modules'), orderBy('order'));
    const unsubscribe = onSnapshot(modulesQuery, (snapshot) => {
        const modulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module));
        form.reset({ modules: modulesData });
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching modules:", error);
        toast({ title: "Erro", description: "Não foi possível carregar os módulos.", variant: "destructive" });
        setIsLoading(false);
    });

    getCourseData();
    
    return () => unsubscribe();
  }, [user, courseId, toast, router, form]);

  const onSubmit = async (values: z.infer<typeof courseModulesSchema>) => {
    if (!user) {
        toast({ title: "Não autenticado", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        const modulesToSave = values.modules.map((module, index) => ({...module, order: index}));
        await saveCourseModules(user.uid, courseId, modulesToSave);
        toast({ title: 'Sucesso!', description: 'Módulos do curso salvos.' });
    } catch (error) {
        console.error("Error saving modules:", error);
        toast({ title: "Erro ao Salvar", description: "Não foi possível salvar os módulos.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/admin/courses">
                <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciar Módulos</h1>
            <p className="text-muted-foreground">Curso: {course?.title}</p>
          </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Módulos do Curso</CardTitle>
              <CardDescription>
                Adicione, remova e reordene os módulos. O tipo de conteúdo ({course?.contentType === 'video' ? 'Vídeo' : 'PDF'}) foi definido na criação do curso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 relative">
                  <div className="flex items-start gap-4">
                     <Button type="button" variant="ghost" size="icon" className="cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                     </Button>
                     <div className="flex-1 space-y-2">
                        <FormField
                          control={form.control}
                          name={`modules.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título do Módulo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Introdução ao Curso" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`modules.${index}.contentUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL do Conteúdo ({course?.contentType === 'video' ? 'Vídeo' : 'PDF'})</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                     </div>
                     <div className='flex flex-col gap-2'>
                        <Button type="button" variant="outline" size="icon" onClick={() => { /* Prova logic here */ }}>
                            <FileQuestion className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => append({ title: '', contentUrl: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Módulo
              </Button>
            </CardContent>
          </Card>
          <div className="flex justify-end">
             <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Salvar Módulos
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
