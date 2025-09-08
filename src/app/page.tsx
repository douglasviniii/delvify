
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { SectionComponents, CoursesSection, LatestPostsSection } from '@/components/page-sections';
import { promises as fs } from 'fs';
import path from 'path';
import { initialHomePageSections } from '@/lib/page-data';
import { getAllBlogPosts } from '@/lib/blog-posts';

// This is the main tenant ID for the public-facing website.
// In a real multi-domain app, you would resolve this based on the request's hostname.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

async function getHomePageSections() {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/home-page-db.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    // Ensure we return an array, even if the file is empty or malformed
    return Array.isArray(data) ? data : initialHomePageSections;
  } catch (error) {
    console.warn('Could not read home-page-db.json, serving initial data. Error:', error);
    return initialHomePageSections;
  }
}


export default async function Home() {
  // Fetch sections from static data or the file
  const sections = await getHomePageSections();
  
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
