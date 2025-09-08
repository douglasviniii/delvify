import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { SectionComponents } from '@/components/page-sections';
import { initialHomePageSections } from '@/lib/page-data';


// This is a mock function. In a real app, you would fetch this from a database.
async function getPageSections() {
  // For now, we'll just return the hardcoded sections.
  // In a real app, you'd fetch this from a database.
  // We'll simulate that by returning the initial data.
  return initialHomePageSections;
}


export default async function Home() {
  const sections = await getPageSections();

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        {sections.map(section => {
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
