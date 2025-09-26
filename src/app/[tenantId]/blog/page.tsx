
import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts } from '@/lib/blog-posts';
import type { Post } from '@/lib/types';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import { DefaultSection } from '@/components/sections/DefaultSection';
import { BlogPageSection } from '@/components/sections/BlogPageSection';
import { getPageSections } from '../actions';
import { getGlobalSettingsForTenant }from '@/lib/settings';

const SectionComponents: Record<string, React.FC<any>> = {
  BlogPageSection,
  DefaultSection,
};

export default async function BlogPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const [posts, sections, settings] = await Promise.all([
    getAllBlogPosts(tenantId),
    getPageSections(tenantId, 'blog'),
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
            
            const props: { [key: string]: any } = { 
                settings: section.settings 
            };

            if (section.component === 'BlogPageSection') {
                props.posts = posts;
            }

            return <Component key={section.id} {...props} />;
        })}
      </main>
      <MainFooter settings={settings} />
    </div>
  );
}
