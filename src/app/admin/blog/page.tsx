
import { Button } from "@/components/ui/button";
import { PlusCircle, File } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";

type Post = {
    id: string;
    title: string;
    authorName: string;
    status: 'published' | 'draft';
    createdAt: string;
};

// TODO: Adicionar filtragem por tenantId quando a autenticação do servidor for implementada
async function getPosts(tenantId: string): Promise<Post[]> {
    try {
        const postsSnapshot = await adminDb.collection('posts').orderBy('createdAt', 'desc').get();
        if (postsSnapshot.empty) {
            return [];
        }
        
        return postsSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            return {
                id: doc.id,
                title: data.title,
                authorName: data.authorName || 'Admin',
                status: data.status,
                createdAt: createdAtDate.toLocaleDateString('pt-BR'),
            };
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}


export default async function AdminBlogPage() {
  // TODO: Implementar uma forma segura de obter o orgId no servidor.
  const orgId = "admin_tenant"; // Placeholder

  if (!orgId) {
      return (
          <div className="flex h-full items-center justify-center">
              <p>Você deve pertencer a uma organização para ver esta página.</p>
          </div>
      );
  }

  const posts = await getPosts(orgId);

  return (
    <div className="space-y-6">
       <Tabs defaultValue="all">
            <div className="flex items-center">
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="published">Publicados</TabsTrigger>
                    <TabsTrigger value="draft">Rascunhos</TabsTrigger>
                    <TabsTrigger value="archived" className="hidden sm:flex">
                        Arquivados
                    </TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <File className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/admin/blog/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Post
                      </Link>
                    </Button>
                </div>
            </div>
            <TabsContent value="all">
                <Card>
                    <CardHeader>
                        <CardTitle>Postagens do Blog</CardTitle>
                        <CardDescription>
                            Gerencie suas postagens do blog. Você pode criar, editar e excluir postagens.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {posts.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden md:table-cell">Autor</TableHead>
                                        <TableHead className="hidden md:table-cell">Data de Criação</TableHead>
                                        <TableHead>
                                            <span className="sr-only">Ações</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell>
                                          <Badge variant={post.status === 'draft' ? 'outline' : 'default'}>
                                            {post.status === 'draft' ? 'Rascunho' : 'Publicado'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{post.authorName}</TableCell>
                                        <TableCell className="hidden md:table-cell">{post.createdAt}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem>Visualizar</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8">
                                <h3 className="text-xl font-semibold">Nenhum Post Ainda</h3>
                                <p className="text-muted-foreground mt-2">Clique em "Adicionar Post" para começar a escrever.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
