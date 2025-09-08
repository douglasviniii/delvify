
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { HeroSection, FeaturesSection, AiCustomizationSection, CoursesSection, LatestPostsSection, DefaultSection } from '@/components/page-sections';
import { getAllBlogPosts } from '@/lib/blog-posts';
import { adminDb } from '@/lib/firebase-admin';
import { initialHomePageSections } from '@/lib/page-data';

// This is the main tenant ID for the public-facing website.
// In a real multi-domain app, you would resolve this based on the request's hostname.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const SectionComponents: Record<string, React.FC<any>> = {
  HeroSection,
  FeaturesSection,
  AiCustomizationSection,
  CoursesSection,
  LatestPostsSection,
  DefaultSection
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
        return initialHomePageSections;
    } catch (error) {
        console.error("Error fetching page sections, returning initial data:", error);
        return initialHomePageSections;
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
             // Inject posts into LatestPostsSection
            const props = section.component === 'LatestPostsSection' 
                ? { settings: section.settings, posts: latestPosts.slice(0, 4) }
                : { settings: section.settings };

            return <Component key={section.id} {...props} />;
        })}
      </main>
      <MainFooter />
    </div>
  );
}
