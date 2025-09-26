

import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AboutPageSection } from '@/components/sections/AboutPageSection';
import { DefaultSection } from '@/components/sections/DefaultSection';

const initialAboutPageData = {
  title: "Quem Somos",
  sections: [{
    id: 'about-page-main',
    name: 'Conteúdo Quem Somos',
    component: 'AboutPageSection',
    settings: {
        title: "Sobre a DelviFy",
        description: "Inovando o futuro da educação online com tecnologia de ponta e paixão por ensinar e aprender.",
        backgroundColor: "#FFFFFF",
        titleColor: "#000000",
        descriptionColor: "#6c757d",
        storyTitle: "Nossa História",
        storyContent: "A DelviFy é uma marca da Delvind Tecnologia Da Informação LTDA. Somos uma startup de tecnologia focada em oferecer soluções inovadoras para educação online. Nossa plataforma permite que criadores de conteúdo e empresas construam, gerenciem e escalem seus negócios de cursos online através de uma arquitetura robusta, segura e multi-inquilino.\n\nNascemos da visão de democratizar o acesso à tecnologia de ponta para educadores, permitindo que eles se concentrem no que fazem de melhor: criar conteúdo de qualidade.",
        imageUrl: "https://picsum.photos/800/600?random=office",
        layout: 'default',
        items: [
            { icon: 'Target', title: "Nossa Missão", description: "Empoderar criadores de conteúdo com ferramentas poderosas e fáceis de usar para que possam construir negócios de educação online de sucesso e impacto." },
            { icon: 'Building', title: "Nossa Visão", description: "Ser a plataforma de referência na América Latina para a criação e gestão de ecossistemas de aprendizagem online, reconhecida pela inovação e parceria com nossos clientes." },
            { icon: 'Users', title: "Nossos Valores", description: "Inovação contínua, sucesso do cliente em primeiro lugar, transparência, colaboração e paixão por educação." },
        ]
    }
  }]
};


const SectionComponents: Record<string, React.FC<any>> = {
  AboutPageSection,
  DefaultSection,
};

async function getPageSections(tenantId: string, pageId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages/${pageId}`);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
            const pageData = pageSnap.data();
            if (pageData && Array.isArray(pageData.sections)) {
                return pageData.sections;
            }
        }
        
        console.warn(`No page data found for ${tenantId}/${pageId}, returning initial data.`);
        return initialAboutPageData.sections || [];
    } catch (error) {
        console.error("Error fetching page sections, returning initial data:", error);
        return initialAboutPageData.sections || [];
    }
}


export default async function AboutPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const sections = await getPageSections(tenantId, 'about');

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
            
            return <Component key={section.id} settings={section.settings} />;
        })}
      </main>
      <MainFooter />
    </div>
  );
}
