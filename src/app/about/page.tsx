

import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { adminDb } from '@/lib/firebase-admin';
import { initialPageData } from '@/lib/page-data';
import { AboutPageSection, DefaultSection } from '@/components/page-sections';

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const SectionComponents: Record<string, React.FC<any>> = {
  AboutPageSection,
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


export default async function AboutPage() {
  const sections = await getPageSections(MAIN_TENANT_ID, 'about');


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
            
            return <Component key={section.id} settings={section.settings} />;
        })}
      </main>
      <MainFooter />
    </div>
  );
}
