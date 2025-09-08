
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { SectionComponents } from '@/components/page-sections';
import { initialHomePageSections } from '@/lib/page-data';

async function getHomePageSections() {
    try {
        // This fetch needs to be robust against caching issues.
        // Using a relative path is more robust than relying on an env var.
        const res = await fetch('/api/get-page-sections', { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        return data.sections;
    } catch (error) {
        console.error("Error fetching home page sections, falling back to initial data:", error);
        // Fallback to static data if the API fails
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
      </main>
      <MainFooter />
    </div>
  );
}
