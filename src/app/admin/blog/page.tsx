import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminBlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Blog</h1>
            <p className="text-muted-foreground">Crie e gerencie suas postagens no blog.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Post
        </Button>
      </div>
      
      <div className="flex h-[50vh] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
            <h2 className="text-xl font-semibold">Nenhuma Postagem no Blog Ainda</h2>
            <p className="text-muted-foreground mt-2">Clique em "Adicionar Post" para começar.</p>
        </div>
      </div>
    </div>
  );
}
