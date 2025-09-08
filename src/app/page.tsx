
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { SectionComponents } from '@/components/page-sections';
import { initialHomePageSections } from '@/lib/page-data';
import { promises as fs } from 'fs';
import path from 'path';

// Esta função agora lê o arquivo diretamente, igual à API.
// É a maneira mais robusta de buscar dados locais no lado do servidor.
async function getHomePageSections() {
    try {
        const filePath = path.join(process.cwd(), 'src/lib/home-page-db.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return data; // O arquivo já contém o array de seções diretamente
    } catch (error) {
        console.error("Error fetching home page sections from file, falling back to initial data:", error);
        // Fallback para dados estáticos se a leitura do arquivo falhar
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
