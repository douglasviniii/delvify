
export const initialHomePageData = {
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
            name: "Seção de Blog",
            component: "LatestPostsSection",
            settings: {}
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
  
export const initialHomePageSections = initialHomePageData.sections;
