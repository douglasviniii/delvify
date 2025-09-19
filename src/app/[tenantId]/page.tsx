
import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initialPageData } from '@/lib/initial-page-data';
import { HeroSection, FeaturesSection, AiCustomizationSection, CoursesSection, LatestPostsSection, CtaSection, DefaultSection } from "@/components/sections";
import { getAllBlogPosts } from "@/lib/blog-posts";

const SectionComponents: Record<string, React.FC<any>> = {
  HeroSection,
  FeaturesSection,
  AiCustomizationSection,
  CoursesSection,
  LatestPostsSection,
  CtaSection,
  DefaultSection,
};

async function getPageSections(tenantId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/home`);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
            const pageData = pageSnap.data();
            if (pageData && Array.isArray(pageData.sections)) {
                return pageData.sections;
            }
        }
        
        console.warn(`No page data found for ${tenantId}/home, returning initial data.`);
        return initialPageData['home']?.sections || [];
    } catch (error) {
        console.error("Error fetching page sections for tenant, returning initial data:", error);
        return initialPageData['home']?.sections || [];
    }
}

export default async function HomePage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const sections = await getPageSections(tenantId);
  const posts = await getAllBlogPosts(tenantId);

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

            const props: {[key: string]: any} = { settings: section.settings };
            if (section.component === 'LatestPostsSection') {
                props.posts = posts;
            }
            
            return <Component key={section.id} {...props} />;
        })}
      </main>
      <MainFooter />
    </div>
  );
}
