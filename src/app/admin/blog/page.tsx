
import { Button } from "@/components/ui/button";
import { PlusCircle, File } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminBlogPage() {
  const posts = [
    {
      title: "Os Benefícios da Arquitetura Multi-Inquilino",
      author: "Admin",
      status: "Publicado",
      createdAt: "2024-07-15",
    },
    {
      title: "Como a IA está Revolucionando a Educação",
      author: "Admin",
      status: "Publicado",
      createdAt: "2024-06-28",
    },
    {
      title: "Guia para Iniciantes em Next.js",
      author: "Admin",
      status: "Rascunho",
      createdAt: "2024-05-10",
    },
  ];

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
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Post
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
                                <TableRow key={post.title}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>
                                      <Badge variant={post.status === 'Rascunho' ? 'outline' : 'default'}>
                                        {post.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{post.author}</TableCell>
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
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
