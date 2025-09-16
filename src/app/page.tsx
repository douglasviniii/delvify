

import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import { HeroSection, FeaturesSection, AiCustomizationSection, CoursesSection, LatestPostsSection, DefaultSection, CtaSection } from '@/components/sections';
import { getAllBlogPosts } from '@/lib/blog-posts';
import { collection, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initialPageData } from '@/lib/page-data';

const SectionComponents: Record<string, React.FC<any>> = {
  HeroSection,
  FeaturesSection,
  AiCustomizationSection,
  CoursesSection,
  LatestPostsSection,
  DefaultSection,
  CtaSection
};

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

async function getPageSections(tenantId: string, pageId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/${pageId}`);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
            const pageData = pageSnap.data();
            // Ensure sections is an array
            if (pageData && Array.isArray(pageData.sections)) {
                return pageData.sections;
            }
        }
        // If no sections are found or data is invalid, return default
        console.warn(`No page data found for ${tenantId}/${pageId}, returning initial data.`);
        return initialPageData[pageId]?.sections || [];
    } catch (error) {
        console.error("Error fetching page sections, returning initial data:", error);
        return initialPageData[pageId]?.sections || [];
    }
}


export default async function Home() {
  const latestPosts = await getAllBlogPosts(MAIN_TENANT_ID);
  const sections = await getPageSections(MAIN_TENANT_ID, 'home');

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
            
            // Base props for all components
            const props: { [key: string]: any } = { 
                settings: section.settings 
            };

            // Inject posts only into LatestPostsSection
            if (section.component === 'LatestPostsSection') {
                props.posts = latestPosts.slice(0, 4);
            }

            return <Component key={section.id} {...props} />;
        })}
      </main>
      <MainFooter />
    </div>
  );
}
