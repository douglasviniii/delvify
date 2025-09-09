
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, storage, auth } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Upload, Loader2, Video, FileText, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const courseSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  description: z.string().min(10, 'A descrição é muito curta.'),
  price: z.string().regex(/^\d+(,\d{2})?$/, "Formato de preço inválido. Use 123,45").min(1, 'O preço é obrigatório.'),
  coverImageUrl: z.string().url('A URL da imagem de capa é obrigatória.'),
  contentType: z.enum(['video', 'pdf'], { required_error: 'Selecione o tipo de conteúdo.' }),
  status: z.enum(['draft', 'published']).default('draft'),
});

type Course = {
  id: string;
  title: string;
  price: string;
  contentType: 'video' | 'pdf';
  status: 'draft' | 'published';
  createdAt: any;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course & { description: string, coverImageUrl: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      coverImageUrl: '',
      contentType: undefined,
      status: 'draft',
    },
  });

  useEffect(() => {
    if (!user) return;

    const tenantCoursesCollectionPath = `tenants/${user.uid}/courses`;
    const coursesQuery = query(collection(db, tenantCoursesCollectionPath), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
      const courseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(courseData);
    }, (error) => {
        console.error("Error fetching courses: ", error);
        toast({ title: "Erro", description: "Não foi possível carregar os cursos.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && user) {
      const file = event.target.files[0];
      setIsUploading(true);
      try {
        const storageRef = ref(storage, `tenants/${user.uid}/course_covers/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        form.setValue('coverImageUrl', downloadURL, { shouldValidate: true });
        toast({ title: 'Sucesso', description: 'Imagem de capa carregada.' });
      } catch (error) {
        console.error("Upload error:", error);
        toast({ title: 'Erro de Upload', description: 'Não foi possível carregar a imagem.', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEdit = async (course: Course) => {
    if (!user) return;
    const courseRef = doc(db, `tenants/${user.uid}/courses`, course.id);
    const courseSnap = await getDoc(courseRef);
    if (courseSnap.exists()) {
        const fullCourseData = courseSnap.data();
        const fullCourse = {
            id: course.id,
            ...fullCourseData
        } as Course & { description: string, coverImageUrl: string };
        setEditingCourse(fullCourse);
        form.reset(fullCourse);
        setIsDialogOpen(true);
    } else {
        toast({ title: "Erro", description: "Não foi possível carregar os dados completos do curso.", variant: "destructive"});
    }
  };
  
  const handleDelete = async (id: string) => {
      if (!user) return;
      try {
          await deleteDoc(doc(db, `tenants/${user.uid}/courses`, id));
          toast({ title: 'Curso Excluído', description: 'O curso foi removido com sucesso.' });
      } catch(e) {
          console.error("Error deleting document: ", e);
          toast({ title: 'Erro ao Excluir', description: 'Não foi possível remover o curso.', variant: 'destructive' });
      }
  }

  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    if (!user) {
      toast({ title: 'Erro de autenticação', variant: 'destructive'});
      return;
    }
    
    const tenantCoursesCollectionPath = `tenants/${user.uid}/courses`;

    try {
      if (editingCourse) {
        await updateDoc(doc(db, tenantCoursesCollectionPath, editingCourse.id), { ...values, updatedAt: serverTimestamp() });
        toast({ title: 'Curso Atualizado' });
      } else {
        await addDoc(collection(db, tenantCoursesCollectionPath), {
            ...values,
            createdAt: serverTimestamp()
        });
        toast({ title: 'Curso Criado como Rascunho' });
      }
      form.reset();
      setEditingCourse(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao salvar curso', description: 'Não foi possível salvar o curso.', variant: 'destructive' });
    }
  };
  
  const coverImageUrl = form.watch('coverImageUrl');

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Studio de Cursos</h1>
                <p className="text-muted-foreground">Crie e gerencie seus cursos, módulos e lições.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                if (!isOpen) {
                    form.reset();
                    setEditingCourse(null);
                }
                setIsDialogOpen(isOpen);
            }}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Curso
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                <DialogTitle>{editingCourse ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
                <DialogDescription>Preencha os detalhes abaixo. Todo novo curso começa como rascunho.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Título do Curso</FormLabel><FormControl><Input {...field} placeholder="Ex: Introdução à Programação" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} placeholder="Descreva sobre o que é este curso." /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Preço (BRL)</FormLabel><FormControl><Input {...field} placeholder="Ex: 99,90" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contentType" render={({ field }) => (
                            <FormItem><FormLabel>Tipo de Conteúdo Principal</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o formato" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="video"><Video className="inline-block mr-2 h-4 w-4"/> Conteúdo em Vídeo</SelectItem>
                                    <SelectItem value="pdf"><FileText className="inline-block mr-2 h-4 w-4"/> Conteúdo em PDF</SelectItem>
                                </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Imagem de Capa</FormLabel>
                        <FormControl>
                        <div className="flex items-center gap-4">
                            <Input {...field} placeholder="Cole uma URL ou carregue um arquivo" />
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Carregar
                            </Button>
                        </div>
                        </FormControl>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                        {coverImageUrl && <Image src={coverImageUrl} alt="Preview" width={200} height={100} className="mt-2 rounded-md object-cover" />}
                        <FormMessage />
                    </FormItem>
                    )} />

                    <DialogFooter className='pt-4'>
                        <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {editingCourse ? 'Salvar Alterações' : 'Criar Rascunho'}
                        </Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
            </Dialog>
        </div>
        <Card>
            <CardHeader><CardTitle>Seus Cursos</CardTitle></CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Preço (R$)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">Ações</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {courses.length > 0 ? courses.map(course => (
                    <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>
                           {course.contentType === 'video' ? <Video className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>R$ {course.price}</TableCell>
                        <TableCell>
                            <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                                {course.status === 'draft' ? 'Rascunho' : 'Publicado'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" className="h-8 w-8 p-0">
                                       <span className="sr-only">Abrir menu</span>
                                       <MoreHorizontal className="h-4 w-4" />
                                   </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                   <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                   <DropdownMenuItem onClick={() => handleEdit(course)}>
                                       <Edit className="mr-2 h-4 w-4" /> Editar Detalhes
                                   </DropdownMenuItem>
                                   <DropdownMenuItem>
                                       Gerenciar Módulos
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator />
                                   <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o curso.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(course.id)}>Sim, excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                               </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Nenhum curso encontrado.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}
