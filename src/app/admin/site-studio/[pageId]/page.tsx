import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditSitePage({ params }: { params: { pageId: string } }) {
  
  const pageTitle = params.pageId.charAt(0).toUpperCase() + params.pageId.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/site-studio">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Editando: {pageTitle}</h1>
          <p className="text-muted-foreground">Faça alterações no conteúdo e na aparência da sua página.</p>
        </div>
      </div>
       <div className="flex h-[60vh] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
            <h2 className="text-xl font-semibold">Editor de Página em Breve</h2>
            <p className="text-muted-foreground mt-2">Esta área conterá as ferramentas para editar sua página.</p>
        </div>
      </div>
    </div>
  );
}
