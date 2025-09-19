
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth, storage } from '../../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { useToast } from '../../../hooks/use-toast';
import { PlusCircle, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import TiptapEditor from '../../../components/ui/tiptap-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import type { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';


const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -


const blogSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  excerpt: z.string().min(10, 'O resumo é muito curto.').max(500, 'O resumo deve ter no máximo 500 caracteres.'),
  content: z.string().min(50, 'O conteúdo do post é muito curto.'),
  imageUrl: z.string().url('A URL da imagem de capa é obrigatória.'),
  authorId: z.string().optional(), // Now optional
});

type BlogPost = {
  id: string;
  title: string;
  author: string;
  authorId: string;
  createdAt: any;
  imageUrl: string;
  slug: string;
};

type Collaborator = {
  uid: string;
  displayName: string;
};

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost & { excerpt: string, content: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (!user || loading) return; // Don't fetch anything if user is not logged in or auth state is loading

    // Tenant-specific collection path
    const tenantBlogCollectionPath = `tenants/${user.uid}/blog`;

    // Fetch blog posts
    const postsQuery = query(collection(db, tenantBlogCollectionPath), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      setPosts(postData);
    });

    // Fetch collaborators - now tenant-specific
    const tenantCollaboratorsPath = `tenants/${user.uid}/collaborators`;
    const collabsQuery = query(collection(db, tenantCollaboratorsPath));
    const unsubscribeCollabs = onSnapshot(collabsQuery, (snapshot) => {
        const collabsData: Collaborator[] = [];
        snapshot.forEach((doc) => {
            collabsData.push({ ...doc.data(), uid: doc.id } as Collaborator);
        });
        setCollaborators(collabsData);
    }, (error) => {
        console.warn("Could not fetch collaborators. This is not a critical error.", error);
        setCollaborators([]);
    });


    return () => {
      unsubscribePosts();
      unsubscribeCollabs();
    };
  }, [user, loading]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
        toast({ title: 'Erro de Autenticação', description: 'Usuário não encontrado. Faça login novamente.', variant: 'destructive'});
        return;
    }

    setIsUploading(true);
    try {
      const filePath = `tenants/${user.uid}/blog_covers/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      form.setValue('imageUrl', downloadURL, { shouldValidate: true });
      toast({ title: 'Sucesso', description: 'Imagem de capa carregada.' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      console.error("Upload error:", error);
      toast({ title: 'Erro de Upload', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (post: BlogPost) => {
    if (!user) return;
    const postRef = doc(db, `tenants/${user.uid}/blog`, post.id);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
        const fullPostData = postSnap.data();
        const fullPost = {
            id: post.id,
            ...fullPostData,
            authorId: String(fullPostData.authorId || ''),
        } as BlogPost & { excerpt: string, content: string };
        setEditingPost(fullPost);
        form.reset(fullPost);
        setIsDialogOpen(true);
    } else {
        toast({ title: "Erro", description: "Não foi possível carregar os dados completos do post.", variant: "destructive"});
    }
  };
  
  const handleDelete = async (id: string) => {
      if (!user) return;
      try {
          await deleteDoc(doc(db, `tenants/${user.uid}/blog`, id));
          toast({ title: 'Post Excluído', description: 'O post foi removido com sucesso.' });
      } catch(e) {
          console.error("Error deleting document: ", e);
          toast({ title: 'Erro ao Excluir', description: 'Não foi possível remover o post.', variant: 'destructive' });
      }
  }

  const onSubmit = async (values: z.infer<typeof blogSchema>) => {
    if (!user) {
      toast({ title: 'Erro de autenticação', variant: 'destructive'});
      return;
    }
    
    let authorId = user.uid;
    let authorName = user.displayName || "Admin";

    if (values.authorId) {
        const selectedCollaborator = collaborators.find(c => c.uid === values.authorId);
        if (selectedCollaborator) {
            authorId = selectedCollaborator.uid;
            authorName = selectedCollaborator.displayName;
        }
    }
    
    const tenantBlogCollectionPath = `tenants/${user.uid}/blog`;
    const slug = slugify(values.title);

    const dataToSave = {
        title: values.title,
        slug: slug,
        excerpt: values.excerpt,
        content: values.content,
        imageUrl: values.imageUrl,
        author: authorName,
        authorId: authorId,
    };

    try {
      if (editingPost) {
        await updateDoc(doc(db, tenantBlogCollectionPath, editingPost.id), { ...dataToSave, updatedAt: serverTimestamp() });
        toast({ title: 'Post Atualizado' });
      } else {
        await addDoc(collection(db, tenantBlogCollectionPath), {
            ...dataToSave,
            createdAt: serverTimestamp()
        });
        toast({ title: 'Post Publicado' });
      }
      form.reset();
      setEditingPost(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao salvar post', description: 'Não foi possível salvar o post.', variant: 'destructive' });
    }
  };
  
  const form = useForm<z.infer<typeof blogSchema>>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      authorId: '',
    },
  });

  const imageUrl = form.watch('imageUrl');
  
  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
     return <div className="flex h-full items-center justify-center"><p>Você precisa estar logado para gerenciar o blog.</p></div>;
  }
  
  if (error) {
    return <div className="flex h-full items-center justify-center"><p className='text-destructive'>Erro de autenticação: {error.message}</p></div>;
  }

  return (
    <div className="h-full w-full space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Studio de Blog</h1>
                <p className="text-muted-foreground">Crie e gerencie as postagens do seu blog.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                if (!isOpen) {
                    form.reset();
                    setEditingPost(null);
                }
                setIsDialogOpen(isOpen);
            }}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Postagem
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                <DialogTitle>{editingPost ? 'Editar Postagem' : 'Nova Postagem'}</DialogTitle>
                <DialogDescription>Preencha os detalhes abaixo. Clique em salvar quando terminar.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} placeholder="Título da Postagem" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="excerpt" render={({ field }) => (
                    <FormItem><FormLabel>Resumo (aparece nos cards)</FormLabel><FormControl><Textarea {...field} placeholder="Um resumo curto e chamativo para a postagem." /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <FormField
                        control={form.control}
                        name="authorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Autor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} defaultValue={user.uid}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o autor do post..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={user.uid}>Eu ({user.displayName || 'Admin'})</SelectItem>
                                        {collaborators.map((collab) => (
                                            <SelectItem key={collab.uid} value={collab.uid}>{collab.displayName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
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
                        {imageUrl && <Image src={imageUrl} alt="Preview" width={200} height={100} className="mt-2 rounded-md object-cover" />}
                        <FormMessage />
                    </FormItem>
                    )} />

                    <FormField control={form.control} name="content" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Conteúdo do Post</FormLabel>
                            <FormControl>
                                <TiptapEditor
                                    key={editingPost?.id || 'new-post'}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    
                    <DialogFooter className='pt-4'>
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
            </Dialog>
        </div>
        <Card>
            <CardHeader><CardTitle>Postagens Existentes</CardTitle></CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Capa</TableHead><TableHead>Título</TableHead><TableHead>Autor</TableHead><TableHead>Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {posts.map(post => (
                    <TableRow key={post.id}>
                    <TableCell><Image src={post.imageUrl} alt={post.title} width={100} height={60} className="rounded-md object-cover" /></TableCell>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell className="space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(post)}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o post do blog.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(post.id)}>Sim, excluir</AlertDialogAction>
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
    </div>
  );
}

    