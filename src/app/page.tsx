

import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import { HeroSection, FeaturesSection, AiCustomizationSection, CoursesSection, LatestPostsSection, DefaultSection, CtaSection } from '@/components/page-sections';
import { getAllBlogPosts } from '@/lib/blog-posts';
import { adminDb } from '@/lib/firebase-admin';
import { initialHomePageData } from '@/lib/page-data';
import { getGlobalSettingsForTenant } from '@/lib/settings';


// This is the main tenant ID for the public-facing website.
// In a real multi-domain app, you would resolve this based on the request's hostname.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const SectionComponents: Record<string, React.FC<any>> = {
  HeroSection,
  FeaturesSection,
  AiCustomizationSection,
  CoursesSection,
  LatestPostsSection,
  DefaultSection,
  CtaSection
};

async function getPageSections(tenantId: string, pageId: string) {
    try {
        const pageRef = adminDb.collection('tenants').doc(tenantId).collection('pages').doc(pageId);
        const pageSnap = await pageRef.get();

        if (pageSnap.exists) {
            const pageData = pageSnap.data();
            // Ensure sections is an array
            if (pageData && Array.isArray(pageData.sections)) {
                return pageData.sections;
            }
        }
        // If no sections are found or data is invalid, return default
        console.warn(`No page data found for ${tenantId}/${pageId}, returning initial data.`);
        return initialHomePageData.sections;
    } catch (error) {
        console.error("Error fetching page sections, returning initial data:", error);
        return initialHomePageData.sections;
    }
}


export default async function Home() {
  const latestPosts = await getAllBlogPosts(MAIN_TENANT_ID);
  const sections = await getPageSections(MAIN_TENANT_ID, 'home');
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader settings={settings} />
      <main className="flex-1">
        {sections.map(section => {
            const Component = SectionComponents[section.component];
            if (!Component) {
                console.warn(`Component for section type "${section.component}" not found.`);
                return <DefaultSection key={section.id} settings={{title: "Componente não encontrado", description: `O componente para "${section.name}" não foi encontrado.`}} />;
            }
            
            // Base props for all components
            const props: { [key: string]: any } = { 
                key: section.id, 
                settings: section.settings 
            };

            // Inject posts only into LatestPostsSection
            if (section.component === 'LatestPostsSection') {
                props.posts = latestPosts.slice(0, 4);
            }

            return <Component {...props} />;
        })}
      </main>
      <MainFooter />
    </div>
  );
}

