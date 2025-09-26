
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { AiCustomizationSection } from "@/components/sections/AiCustomizationSection";
import { CoursesSection } from "@/components/sections/CoursesSection";
import { LatestPostsSection } from "@/components/sections/LatestPostsSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { DefaultSection } from "@/components/sections/DefaultSection";
import { getAllBlogPosts } from "@/lib/blog-posts";
import { getPageSections } from "./actions";

const SectionComponents: Record<string, React.FC<any>> = {
  HeroSection,
  FeaturesSection,
  AiCustomizationSection,
  CoursesSection,
  LatestPostsSection,
  CtaSection,
  DefaultSection,
};


export default async function HomePage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const sections = await getPageSections(tenantId, 'home');
  const posts = await getAllBlogPosts(tenantId);

  return (
    <main className="flex-1">
        {sections.map(section => {
        const Component = SectionComponents[section.component];
        if (!Component) {
            console.warn(`Component for section type "${section.component}" not found.`);
            return <DefaultSection key={section.id} settings={{title: "Componente não encontrado", description: `O componente para "${section.name}" não foi encontrado.`}} />;
        }

        const props: {[key: string]: any} = { settings: section.settings };
        if (section.component === 'LatestPostsSection') {
            props.posts = posts;
        }
        
        return <Component key={section.id} {...props} />;
    })}
    </main>
  );
}
