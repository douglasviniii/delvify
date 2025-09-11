
import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts } from '@/lib/blog-posts';
import type { Post } from '@/lib/types';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import { adminDb } from '@/lib/firebase-admin';
import { initialPageData } from '@/lib/page-data';
import { DefaultSection, BlogPageSection } from '@/components/page-sections';

// Este é o ID do inquilino para o qual os posts estão sendo criados no admin.
// Em uma aplicação multi-domínio real, você resolveria isso com base no hostname da requisição.
const TENANT_ID_WITH_POSTS = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const SectionComponents: Record<string, React.FC<any>> = {
  BlogPageSection,
  DefaultSection,
};

async function getPageSections(tenantId: string, pageId: string) {
    try {
        const pageRef = adminDb.collection('tenants').doc(tenantId).collection('pages').doc(pageId);
        const pageSnap = await pageRef.get();

        if (pageSnap.exists) {
            const pageData = pageSnap.data();
            if (pageData && Array.isArray(pageData.sections)) {
                return pageData.sections;
            }
        }
        
        console.warn(`No page data found for ${tenantId}/${pageId}, returning initial data.`);
        return initialPageData[pageId]?.sections || [];
    } catch (error) {
        console.error("Error fetching page sections, returning initial data:", error);
        return initialPageData[pageId]?.sections || [];
    }
}


export default async function BlogPage() {
  const posts = await getAllBlogPosts(TENANT_ID_WITH_POSTS);
  const sections = await getPageSections(TENANT_ID_WITH_POSTS, 'blog');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex-1">
         {sections.map(section => {
            const Component = SectionComponents[section.component];
            if (!Component) {
                console.warn(`Component for section type "${section.component}" not found.`);
                return <DefaultSection key={section.id} settings={{title: "Componente não encontrado", description: `O componente para "${section.name}" não foi encontrado.`}} />;
            }
            
            const props: { [key: string]: any } = { 
                settings: section.settings 
            };

            if (section.component === 'BlogPageSection') {
                props.posts = posts;
            }

            return <Component key={section.id} {...props} />;
        })}
      </main>
      <MainFooter />
    </div>
  );
}
