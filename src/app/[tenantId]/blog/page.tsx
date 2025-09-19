
import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts } from '@/lib/blog-posts';
import type { Post } from '@/lib/types';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initialPageData } from '@/lib/initial-page-data';
import { DefaultSection } from '@/components/sections/DefaultSection';
import { BlogPageSection } from '@/components/sections/BlogPageSection';

const SectionComponents: Record<string, React.FC<any>> = {
  BlogPageSection,
  DefaultSection,
};

async function getPageSections(tenantId: string, pageId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/${pageId}`);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
            const pageData = pageSnap.data();
            if (pageData && Array.isArray(pageData.sections)) {
                return pageData.sections;
            }
        }
        
        console.warn(`No page data found for ${tenantId}/${pageId}, returning initial data.`);
        return initialPageData[pageId as keyof typeof initialPageData]?.sections || [];
    } catch (error) {
        console.error("Error fetching page sections, returning initial data:", error);
        return initialPageData[pageId as keyof typeof initialPageData]?.sections || [];
    }
}


export default async function BlogPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const posts = await getAllBlogPosts(tenantId);
  const sections = await getPageSections(tenantId, 'blog');

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
