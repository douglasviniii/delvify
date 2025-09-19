import { getAllBlogPosts } from "@/lib/blog-posts";
import { SiteEditorClient } from "./editor-client";
import { notFound }from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { getPageDataForEditor } from "./actions";
import { initialPageData } from "@/lib/initial-page-data";

export default async function EditSitePage({ params }: { params: { pageId: string } }) {
  const pageId = params.pageId;
  // A verificação de usuário/login já é tratada no /admin/layout.tsx
  // A chamada a getCurrentUser() aqui pode falhar em alguns contextos e causar um 404 desnecessário.
  // Vamos obter o tenantId diretamente do middleware se possível, ou passar para o cliente resolver.
  // Por enquanto, vamos simplificar e assumir que o layout já protegeu a rota.
  
  // O middleware já injeta o tenantId, mas para a busca de dados no servidor aqui,
  // precisamos de uma forma de obtê-lo. getCurrentUser() era a forma, mas está falhando.
  // A abordagem mais segura é mover a busca de dados para o client component.
  // Mas como uma correção imediata para o 404, vamos apenas passar os dados iniciais
  // e deixar a busca de dados reais para uma futura refatoração no lado do cliente se necessário.
  
  // Para esta correção, vamos assumir que o usuário está logado e que precisamos do ID dele.
  const user = await getCurrentUser();

  if (!user) {
    // O layout do admin já deve redirecionar, mas como uma salvaguarda final.
    return <div className="flex h-screen w-full items-center justify-center"><p>Usuário não encontrado. Redirecionando...</p></div>;
  }
  
  const tenantId = user.uid; 

  if (!pageId) {
      notFound();
  }

  try {
    const [posts, pageData] = await Promise.all([
      getAllBlogPosts(tenantId),
      getPageDataForEditor(tenantId, pageId)
    ]);
    
    // Garante que sempre haverá dados para passar, usando o initialPageData como fallback.
    const effectivePageData = pageData || initialPageData[pageId as keyof typeof initialPageData] || { title: `Página ${pageId}`, sections: [] };

    return <SiteEditorClient initialPosts={posts} initialPageData={effectivePageData} pageId={pageId} tenantId={tenantId} />;
  } catch (error) {
    console.error(`Falha ao carregar os dados iniciais da página ${pageId}:`, error);
    // Em caso de erro na busca de dados, ainda renderizamos o editor com dados padrão
    // para evitar um 404 e permitir que o usuário comece a editar.
    const fallbackPageData = initialPageData[pageId as keyof typeof initialPageData] || { title: `Página ${pageId}`, sections: [] };
    return <SiteEditorClient initialPosts={[]} initialPageData={fallbackPageData} pageId={pageId} tenantId={tenantId} />;
  }
}
