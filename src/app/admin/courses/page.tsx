
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth, storage } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Upload, Video, FileText, MoreHorizontal, CheckCircle2, Eye, Star, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { User } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateCourseStatus, createCategory, deleteCategory } from './actions';
import type { Category } from '@/lib/types';
import { useFormStatus } from 'react-dom';


const courseSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  description: z.string().min(10, 'A descrição é muito curta.'),
  price: z.string().regex(/^\d+(,\d{2})?$/, "Formato de preço inválido. Use 123,45 ou 0 para gratuito."),
  promotionalPrice: z.string().regex(/^\d+(,\d{2})?$/, "Formato de preço inválido.").optional().or(z.literal('')),
  category: z.string().min(1, 'A categoria é obrigatória.'),
  tag: z.string().optional(),
  coverImageUrl: z.string().url('A URL da imagem de capa é obrigatória.'),
  contentType: z.enum(['video', 'pdf'], { required_error: 'Selecione o tipo de conteúdo.' }),
  durationHours: z.string().regex(/^\d+$/, "Apenas números são permitidos.").min(1, "A carga horária é obrigatória."),
  status: z.enum(['draft', 'published']).default('draft'),
});

const categorySchema = z.object({
    name: z.string().min(2, "O nome da categoria é obrigatório."),
});

type Course = {
  id: string;
  title: string;
  price: string;
  promotionalPrice?: string;
  category: string;
  tag?: string;
  contentType: 'video' | 'pdf';
  durationHours: number;
  status: 'draft' | 'published';
  createdAt: any;
  coverImageUrl: string;
  description: string;
};

const CourseCard = ({ course, onStatusChange, isChangingStatus, onEdit, onDelete }: { course: Course, onStatusChange: (newStatus: 'draft' | 'published') => void, isChangingStatus: boolean, onEdit: () => void, onDelete: () => void }) => {
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
    <Card className="overflow-hidden shadow-lg flex flex-col group relative">
        <Link href={`/courses/${course.id}`} className="flex flex-col flex-1" target="_blank">
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
        </Link>
        <CardFooter className="p-4 bg-muted/20 flex justify-between items-center z-10">
             {displayPrice()}
            <div className='flex items-center gap-2'>
                <Button 
                size="sm" 
                variant={course.status === 'published' ? 'secondary' : 'default'}
                onClick={(e) => {
                    e.stopPropagation(); 
                    onStatusChange(course.status === 'draft' ? 'published' : 'draft')
                }}
                disabled={isChangingStatus}
                >
                    {isChangingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (course.status === 'published' ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4"/>)}
                    {course.status === 'published' ? 'Publicado' : 'Publicar'}
                </Button>
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="h-8 w-8 p-0">
                           <span className="sr-only">Abrir menu</span>
                           <MoreHorizontal className="h-4 w-4" />
                       </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                       <DropdownMenuLabel>Ações</DropdownMenuLabel>
                       <DropdownMenuItem onClick={onEdit}>
                           <Edit className="mr-2 h-4 w-4" /> Editar Detalhes
                       </DropdownMenuItem>
                       <Link href={`/admin/courses/${course.id}`} passHref>
                        <DropdownMenuItem>
                            Gerenciar Episódios
                        </DropdownMenuItem>
                       </Link>
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
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o curso e todos os seus episódios.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete}>Sim, excluir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                   </DropdownMenuContent>
               </DropdownMenu>
            </div>
        </CardFooter>
    </Card>
    )
};


function CategoryForm({ tenantId }: { tenantId: string }) {
    const { pending } = useFormStatus();
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    async function action(formData: FormData) {
        const name = formData.get('name');
        if (typeof name !== 'string' || !tenantId) return;

        const result = await createCategory(tenantId, name);
        if (result.success) {
            toast({ title: 'Sucesso!', description: 'Categoria criada.' });
            formRef.current?.reset();
        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' });
        }
    }

    return (
        <form ref={formRef} action={action} className="flex items-center gap-2">
            <Input name="name" placeholder="Nova Categoria (Ex: Desenvolvimento)" required/>
            <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Criar
            </Button>
        </form>
    );
}

function CategoryManager({ user }: { user: User | null }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (!user) return;
        const tenantCategoriesPath = `tenants/${user.uid}/categories`;
        const catQuery = query(collection(db, tenantCategoriesPath), orderBy('name'));
        const unsubscribe = onSnapshot(catQuery, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Category)));
        });
        return () => unsubscribe();
    }, [user]);

    const handleDeleteCategory = async (categoryId: string) => {
        if (!user) return;
        const result = await deleteCategory(user.uid, categoryId);
        if(result.success) {
            toast({ title: 'Sucesso!', description: 'Categoria removida.' });
        } else {
            toast({ title: 'Erro', description: result.message, variant: 'destructive' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gerenciar Categorias</CardTitle>
                <CardDescription>Crie e remova categorias para organizar seus cursos.</CardDescription>
            </CardHeader>
            <CardContent>
                {user && <CategoryForm tenantId={user.uid} />}
            </CardContent>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map(cat => (
                            <TableRow key={cat.id}>
                                <TableCell>{cat.name}</TableCell>
                                <TableCell className="text-right">
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. Excluir uma categoria não afeta cursos já existentes.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)}>Sim, excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusChangingCourseId, setStatusChangingCourseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      promotionalPrice: '',
      category: '',
      tag: '',
      coverImageUrl: '',
      contentType: undefined,
      durationHours: '',
      status: 'draft',
    },
  });

  useEffect(() => {
    if (!user) return;

    const tenantCoursesCollectionPath = `tenants/${user.uid}/courses`;
    const coursesQuery = query(collection(db, tenantCoursesCollectionPath), orderBy('createdAt', 'desc'));
    
    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
      const courseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(courseData);
    }, (error) => {
        console.error("Error fetching courses: ", error);
        toast({ title: "Erro", description: "Não foi possível carregar os cursos.", variant: "destructive" });
    });

    const tenantCategoriesPath = `tenants/${user.uid}/categories`;
    const catQuery = query(collection(db, tenantCategoriesPath), orderBy('name'));
    const unsubscribeCategories = onSnapshot(catQuery, (snapshot) => {
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Category)));
    });


    return () => {
        unsubscribeCourses();
        unsubscribeCategories();
    };
  }, [user, toast]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const filePath = `tenants/${user.uid}/course_covers/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      form.setValue('coverImageUrl', downloadURL, { shouldValidate: true });
      toast({ title: 'Sucesso', description: 'Imagem de capa carregada.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      console.error("Upload error:", error);
      toast({ title: 'Erro de Upload', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsUploading(false);
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
        } as Course;
        setEditingCourse(fullCourse);
        form.reset({
          ...fullCourse,
          promotionalPrice: fullCourse.promotionalPrice || '',
          tag: fullCourse.tag || '',
          durationHours: String(fullCourse.durationHours),
        });
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

  const handleStatusChange = async (courseId: string, newStatus: 'draft' | 'published') => {
    if (!user) return;
    setStatusChangingCourseId(courseId);
    const result = await updateCourseStatus(user.uid, courseId, newStatus);
    if (result.success) {
      toast({ title: "Sucesso!", description: `Curso ${newStatus === 'published' ? 'publicado' : 'movido para rascunho'}.`});
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
    setStatusChangingCourseId(null);
  };

  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    if (!user) {
      toast({ title: 'Erro de autenticação', variant: 'destructive'});
      return;
    }
    
    const tenantCoursesCollectionPath = `tenants/${user.uid}/courses`;
    const dataToSave = {
        ...values,
        durationHours: parseInt(values.durationHours, 10)
    };

    try {
      if (editingCourse) {
        await updateDoc(doc(db, tenantCoursesCollectionPath, editingCourse.id), { ...dataToSave, updatedAt: serverTimestamp() });
        toast({ title: 'Curso Atualizado' });
        setIsDialogOpen(false);
      } else {
        const newCourseRef = await addDoc(collection(db, tenantCoursesCollectionPath), {
            ...dataToSave,
            createdAt: serverTimestamp()
        });
        toast({ title: 'Curso Criado como Rascunho', description: 'Agora adicione os episódios do curso.' });
        setIsDialogOpen(false);
        router.push(`/admin/courses/${newCourseRef.id}`);
      }
      
      form.reset();
      setEditingCourse(null);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao salvar curso', description: 'Não foi possível salvar o curso.', variant: 'destructive' });
    }
  };
  
  const coverImageUrl = form.watch('coverImageUrl');

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Studio de Cursos</h1>
                <p className="text-muted-foreground">Crie e gerencie seus cursos, episódios e provas.</p>
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
                            <FormItem><FormLabel>Preço (BRL)</FormLabel><FormControl><Input {...field} placeholder="Ex: 99,90 ou 0 para gratuito" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="promotionalPrice" render={({ field }) => (
                            <FormItem><FormLabel>Preço Promocional (Opcional)</FormLabel><FormControl><Input {...field} placeholder="Ex: 49,90" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma categoria..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Ajuda a organizar e filtrar cursos.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="tag" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Etiqueta do Curso (Opcional)</FormLabel>
                                <FormControl><Input {...field} placeholder="Ex: Mais Vendido, Lançamento" /></FormControl>
                                <FormDescription>Uma etiqueta curta para destacar o curso.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="contentType" render={({ field }) => (
                            <FormItem><FormLabel>Tipo de Conteúdo Principal</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o formato" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="video"><Video className="inline-block mr-2 h-4 w-4"/> Conteúdo em Vídeo</SelectItem>
                                    <SelectItem value="pdf"><FileText className="inline-block mr-2 h-4 w-4"/> Slides (Imagens)</SelectItem>
                                </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="durationHours" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Carga Horária (em horas)</FormLabel>
                                <FormControl><Input type="number" {...field} placeholder="Ex: 40" /></FormControl>
                                <FormDescription>Define o tempo mínimo para liberação do certificado.</FormDescription>
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
                            {editingCourse ? 'Salvar Alterações' : 'Criar e Gerenciar Episódios'}
                        </Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
            </Dialog>
        </div>
        
        <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manage">Gerenciar Cursos</TabsTrigger>
                <TabsTrigger value="preview">Visualizar como Aluno</TabsTrigger>
                <TabsTrigger value="categories">Categorias</TabsTrigger>
            </TabsList>
            <TabsContent value="manage">
                <Card>
                    <CardHeader><CardTitle>Seus Cursos</CardTitle></CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Categoria</TableHead>
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
                                    <Badge variant="outline">{course.category}</Badge>
                                </TableCell>
                                <TableCell>
                                   {course.promotionalPrice && course.promotionalPrice !== course.price ? (
                                        <span>
                                            <span className="line-through text-muted-foreground">R$ {course.price}</span> R$ {course.promotionalPrice}
                                        </span>
                                   ) : `R$ ${course.price}`}
                                </TableCell>
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
                                           <Link href={`/admin/courses/${course.id}`} passHref>
                                            <DropdownMenuItem>
                                                Gerenciar Episódios
                                            </DropdownMenuItem>
                                           </Link>
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
            </TabsContent>
            <TabsContent value="preview">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {courses.map(course => (
                        <CourseCard 
                            key={course.id} 
                            course={course}
                            onStatusChange={(newStatus) => handleStatusChange(course.id, newStatus)}
                            isChangingStatus={statusChangingCourseId === course.id}
                            onEdit={() => handleEdit(course)}
                            onDelete={() => handleDelete(course.id)}
                        />
                    ))}
                 </div>
                 {courses.length === 0 && (
                     <Card>
                        <CardContent className="h-48 flex items-center justify-center">
                            <p className="text-muted-foreground">Nenhum curso encontrado para visualizar.</p>
                        </CardContent>
                     </Card>
                 )}
            </TabsContent>
            <TabsContent value="categories">
                <CategoryManager user={user} />
            </TabsContent>
        </Tabs>

    </div>
  );
}
