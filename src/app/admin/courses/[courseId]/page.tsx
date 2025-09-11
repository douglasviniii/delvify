
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, PlusCircle, Trash2, GripVertical, FileQuestion, Upload, Award } from 'lucide-react';
import { saveCourseModules } from './actions';
import { uploadFile } from '../../upload-action';

const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'O título do episódio é obrigatório.'),
  description: z.string().optional(),
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
  const [isUploading, setIsUploading] = useState<number | null>(null); // Track which module index is uploading
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
        toast({ title: 'Sucesso!', description: 'Episódios do curso salvos.' });
    } catch (error) {
        console.error("Error saving modules:", error);
        toast({ title: "Erro ao Salvar", description: "Não foi possível salvar os episódios.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleFileSelectAndUpload = async (event: React.ChangeEvent<HTMLInputElement>, moduleIndex: number) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(moduleIndex);
    try {
      const fileBuffer = await file.arrayBuffer();
      const filePath = `tenants/${user.uid}/course_content/${courseId}/${Date.now()}_${file.name}`;
      
      const result = await uploadFile(filePath, file.type, fileBuffer);

      if (result.success && result.url) {
        form.setValue(`modules.${moduleIndex}.contentUrl`, result.url, { shouldValidate: true });
        toast({ title: 'Sucesso', description: 'Arquivo do episódio carregado.' });
      } else {
        throw new Error(result.message || 'Falha no upload do arquivo.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      console.error("Upload error:", error);
      toast({ title: 'Erro de Upload', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsUploading(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="icon">
                <Link href="/admin/courses">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciar Episódios</h1>
                <p className="text-muted-foreground">Curso: {course?.title}</p>
              </div>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/admin/certificates/settings`} target="_blank">
                <Award className="mr-2 h-4 w-4" />
                Configurar Certificado
            </Link>
          </Button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={course?.contentType === 'pdf' ? '.pdf' : 'video/*'}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Episódios do Curso</CardTitle>
              <CardDescription>
                Adicione, remova e reordene os episódios. O tipo de conteúdo ({course?.contentType === 'video' ? 'Vídeo' : 'PDF'}) foi definido na criação do curso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 relative bg-muted/30">
                  <div className="flex items-start gap-4">
                     <Button type="button" variant="ghost" size="icon" className="cursor-grab mt-6">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                     </Button>
                     <div className="flex-1 space-y-4">
                        <FormField
                          control={form.control}
                          name={`modules.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título do Episódio</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Introdução ao Curso" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`modules.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição do Episódio (Opcional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Descreva o que será abordado neste episódio." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`modules.${index}.contentUrl`}
                          render={({ field: urlField }) => (
                            <FormItem>
                               <FormLabel>Arquivo de Conteúdo ({course?.contentType === 'video' ? 'Vídeo' : 'PDF'})</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-4">
                                      <Input placeholder="Cole uma URL ou carregue um arquivo" {...urlField} />
                                      <Button 
                                        type="button" 
                                        variant="outline"
                                        disabled={isUploading === index}
                                        onClick={() => {
                                            if (fileInputRef.current) {
                                                fileInputRef.current.onchange = (e) => handleFileSelectAndUpload(e as any, index);
                                                fileInputRef.current.click();
                                            }
                                        }}
                                      >
                                        {isUploading === index ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Carregar
                                      </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                           )}
                        />
                     </div>
                     <div className='flex flex-col gap-2 mt-6'>
                        <Button type="button" variant="outline" size="icon" onClick={() => toast({title: "Em breve!", description: "A criação de provas será implementada em breve."})}>
                            <FileQuestion className="h-4 w-4" />
                             <span className="sr-only">Adicionar Prova</span>
                        </Button>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir Episódio</span>
                        </Button>
                     </div>
                  </div>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => append({ title: '', description: '', contentUrl: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Episódio
              </Button>
            </CardContent>
          </Card>
          <div className="flex justify-end">
             <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
