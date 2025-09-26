

import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { FaqPageSection } from '@/components/sections/FaqPageSection';
import { DefaultSection } from '@/components/sections/DefaultSection';
import { getPageSections } from "../actions";
import { getGlobalSettingsForTenant } from "@/lib/settings";

const SectionComponents: Record<string, React.FC<any>> = {
  FaqPageSection,
  DefaultSection,
};

export default async function FAQPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const [sections, settings] = await Promise.all([
    getPageSections(tenantId, 'faq'),
    getGlobalSettingsForTenant(tenantId)
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader settings={settings} />
      <main className="flex-1">
        {sections.map(section => {
            const Component = SectionComponents[section.component];
            if (!Component) {
                console.warn(`Component for section type "${section.component}" not found.`);
                return <DefaultSection key={section.id} settings={{title: "Componente não encontrado", description: `O componente para "${section.name}" não foi encontrado.`}} />;
            }
            
            return <Component key={section.id} settings={section.settings} />;
        })}
      </main>
      <MainFooter settings={settings} />
    </div>
  );
}
