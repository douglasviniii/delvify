
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { SectionComponents } from '@/components/page-sections';
import { initialHomePageSections } from '@/lib/page-data';

export default async function Home() {
  const sections = initialHomePageSections;

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
