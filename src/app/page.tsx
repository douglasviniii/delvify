
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { SectionComponents, CoursesSection, LatestPostsSection } from '@/components/page-sections';
import { promises as fs } from 'fs';
import path from 'path';
import { initialHomePageSections } from '@/lib/page-data';

async function getHomePageSections() {
    try {
        const filePath = path.join(process.cwd(), 'src/lib/home-page-db.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        // O componente espera um array, não o objeto que o contém.
        return data; 
    } catch (error) {
        console.error("Error fetching home page sections from file, falling back to initial data:", error);
        // O fallback também deve retornar o array diretamente.
        return initialHomePageSections;
    }
}

export default async function Home() {
  const sections = await getHomePageSections();

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
        <LatestPostsSection />
      </main>
      <MainFooter />
    </div>
  );
}
