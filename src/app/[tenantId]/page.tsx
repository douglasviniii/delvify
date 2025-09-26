
import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { AiCustomizationSection } from "@/components/sections/AiCustomizationSection";
import { CoursesSection } from "@/components/sections/CoursesSection";
import { LatestPostsSection } from "@/components/sections/LatestPostsSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { DefaultSection } from "@/components/sections/DefaultSection";
import { getAllBlogPosts } from "@/lib/blog-posts";

const initialHomePageData = {
    title: 'Página Inicial',
    sections: [
        {
          id: "hero",
          name: "Seção de Herói",
          component: "HeroSection",
          settings: {
            title: "A Plataforma Completa para Criação de Cursos",
            description: "DelviFy oferece uma solução robusta e multi-inquilino para construir, gerenciar e escalar seu negócio de educação online com facilidade.",
            backgroundColor: "#FFFFFF",
            titleColor: "#000000",
            descriptionColor: "#6c757d",
            button1Text: "Ir para Cursos",
            button1Link: "/courses",
            button2Text: "Saber Mais",
            button2Link: "#",
          },
        },
        {
          id: "features",
          name: "Seção de Recursos",
          component: "FeaturesSection",
          settings: {
            title: "Recursos Poderosos para a Educação Moderna",
            description: "Tudo que você precisa para criar uma plataforma de aprendizado online de sucesso.",
            features: [
              { icon: 'Layers', title: 'Arquitetura Multi-Inquilino', description: 'Isole e sirva conteúdo, marca e páginas de destino personalizadas com base no domínio.' },
              { icon: 'Palette', title: 'Painel de Administração Específico do Inquilino', description: 'Gerencie cursos, marca e usuários com uma interface de administração dedicada, incluindo personalização com IA.' },
              { icon: 'Newspaper', title: 'Motor de Blog', description: 'Compartilhe notícias e atualizações com uma plataforma de blog simples e integrada para cada domínio de inquilino.' },
              { icon: 'ShieldCheck', title: 'Autenticação Segura de Usuário', description: 'Níveis de acesso separados para administradores e alunos com um sistema seguro de login e registro.' },
            ],
            backgroundColor: "#F9FAFB",
            titleColor: "#000000",
            descriptionColor: "#6c757d",
            cardColor: "#ffffff",
          },
        },
        {
          id: "ai-customization",
          name: "Seção de IA",
          component: "AiCustomizationSection",
          settings: {
            title: "Personalize Sua Plataforma com IA",
            description: "Use linguagem natural para personalizar instantaneamente a marca do seu inquilino. Nossa ferramenta de GenAI interpreta suas instruções para criar a aparência perfeita para o seu site.",
            buttonText: "Experimente a IA de Marca",
            buttonLink: "/admin/settings",
            imageUrl: "https://picsum.photos/800/600",
            backgroundColor: "#FFFFFF",
            titleColor: "#000000",
            descriptionColor: "#6c757d",
            layout: "default",
          },
        },
        {
            id: "courses",
            name: "Seção de Cursos",
            component: "CoursesSection",
            settings: {}
        },
        {
            id: "latest-posts",
            name: "Seção de Blog da Home",
            component: "LatestPostsSection",
            settings: {
                title: "Últimas do Blog",
                description: "Fique por dentro das novidades, dicas e artigos."
            }
        },
        {
            id: "cta-section",
            name: "Seção de CTA",
            component: "CtaSection",
            settings: {
                title: "Quer Vender na DelviFy?",
                description: "Crie sua conta de parceiro, configure sua plataforma e comece a vender seus cursos e produtos em seu próprio domínio.",
                buttonText: "Crie sua Conta Agora",
                buttonLink: "/signup"
            }
        }
    ]
};

const SectionComponents: Record<string, React.FC<any>> = {
  HeroSection,
  FeaturesSection,
  AiCustomizationSection,
  CoursesSection,
  LatestPostsSection,
  CtaSection,
  DefaultSection,
};

async function getPageSections(tenantId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/home`);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
            const pageData = pageSnap.data();
            if (pageData && Array.isArray(pageData.sections)) {
                return pageData.sections;
            }
        }
        
        console.warn(`No page data found for ${tenantId}/home, returning initial data.`);
        return initialHomePageData.sections || [];
    } catch (error) {
        console.error("Error fetching page sections for tenant, returning initial data:", error);
        return initialHomePageData.sections || [];
    }
}

export default async function HomePage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const sections = await getPageSections(tenantId);
  const posts = await getAllBlogPosts(tenantId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
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
      <MainFooter />
    </div>
  );
}
