
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { SectionComponents } from '@/components/page-sections';
import { promises as fs } from 'fs';
import path from 'path';
import { initialHomePageSections } from '@/lib/page-data';

async function getPageSections() {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/home-page-db.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    if (!fileContent.trim()) {
        return initialHomePageSections;
    }
    const sections = JSON.parse(fileContent);
    return sections;
  } catch (error) {
    console.error("Failed to read or parse page sections, returning initial data:", error);
    return initialHomePageSections; 
  }
}

export default async function Home() {
  const sections = await getPageSections();

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
      </main>
      <MainFooter />
    </div>
  );
}
