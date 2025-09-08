
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { SectionComponents, CoursesSection, LatestPostsSection } from '@/components/page-sections';
import { initialHomePageSections } from '@/lib/page-data';
import { getAllBlogPosts } from '@/lib/blog-posts';

// This is the main tenant ID for the public-facing website.
// In a real multi-domain app, you would resolve this based on the request's hostname.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function Home() {
  // Fetch sections from static data
  const sections = initialHomePageSections;
  
  // Fetch latest posts only for the main tenant
  const latestPosts = await getAllBlogPosts(MAIN_TENANT_ID);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex-1">
        {Array.isArray(sections) && sections.map(section => {
            const Component = SectionComponents[section.component];
            if (!Component) {
                console.warn(`Component for section type "${section.component}" not found.`);
                return null;
            }
            return <Component key={section.id} settings={section.settings} />;
        })}
        <CoursesSection />
        <LatestPostsSection posts={latestPosts.slice(0, 4)} />
      </main>
      <MainFooter />
    </div>
  );
}
