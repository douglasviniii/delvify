
import { createPost } from "@/app/admin/blog/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default function NewPostPage() {
  return (
    <form action={createPost} className="space-y-6">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/admin/blog">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Novo Post do Blog</h1>
                <p className="text-muted-foreground">Preencha os detalhes abaixo para criar um novo post.</p>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" placeholder="Título do seu post" required />
        </div>

        <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea id="content" name="content" placeholder="Escreva seu post aqui..." rows={15} required />
        </div>

        <div className="flex justify-end gap-2">
             <Button variant="outline" asChild>
                <Link href="/admin/blog">Cancelar</Link>
            </Button>
            <Button type="submit">Salvar Rascunho</Button>
        </div>
    </form>
  );
}
