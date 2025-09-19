

interface Section {
    id: string;
    name: string;
    component: string;
    settings: { [key: string]: any };
}

interface PageData {
    title: string;
    sections: Section[];
}

const homePageSections: Section[] = [
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
];

const createDefaultPageData = (title: string, mainComponent: string, settings = {}): PageData => ({
    title: `Página de ${title}`,
    sections: [
        {
            id: `${title.toLowerCase().replace(/[\s_]+/g, '-')}-main`,
            name: `Conteúdo Principal de ${title}`,
            component: mainComponent,
            settings: {
                title: `Bem-vindo à Página de ${title}`,
                description: `Este é o conteúdo principal da página de ${title}. Edite esta seção para adicionar as informações relevantes.`,
                ...settings
            }
        }
    ]
});


export const initialPageData: Record<string, PageData> = {
    home: {
        title: 'Página Inicial',
        sections: homePageSections,
    },
    courses: createDefaultPageData("Cursos", "CoursesSection"),
    blog: {
        title: "Página do Blog",
        sections: [{
            id: 'blog-page-main',
            name: "Conteúdo da Página do Blog",
            component: 'BlogPageSection',
            settings: {
                title: "Nosso Blog",
                description: "Fique por dentro das últimas notícias, dicas e insights da nossa equipe."
            }
        }]
    },
    about: {
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
    },
    faq: {
      title: "FAQ",
      sections: [{
        id: 'faq-page-main',
        name: 'Conteúdo FAQ',
        component: 'FaqPageSection',
        settings: {
          title: "Perguntas Frequentes (FAQ)",
          description: "Encontre aqui as respostas para as dúvidas mais comuns sobre nossa plataforma.",
          faqItems: [
              { question: "Como funcionam os repasses financeiros?", answer: "Os repasses dos valores de vendas ocorrem uma vez por mês. O valor transferido para a conta bancária fornecida pela sua empresa já é líquido, ou seja, com todos os impostos devidos já retidos. Você pode acompanhar todas as vendas, valores a receber e relatórios completos em tempo real através do seu painel de controle (dashboard) na plataforma." },
              { question: "Quais são as taxas da plataforma?", answer: "Nossa estrutura de taxas é dividida em duas partes: a taxa da intermediadora de pagamentos (Stripe) e a taxa de administração da DelviFy. É importante entender que a DelviFy não define as taxas da Stripe; elas são custos da 'maquininha de cartão virtual' que garante a segurança das transações. Além disso, há uma taxa de 9% da DelviFy por venda, que cobre os custos de infraestrutura, manutenção e administração financeira da plataforma, substituindo uma mensalidade fixa." },
              { question: "Quais são as taxas da intermediadora Stripe?", answer: "A Stripe, nossa parceira para processamento de pagamentos, aplica as seguintes taxas sobre as transações: Cartão de crédito/débito nacional: 3,99% + R$ 0,39 por venda. Cartão internacional: 3,99% + R$ 0,39 + 2% de conversão. PIX: 1,19% por venda. Boleto: R$ 3,45 por boleto pago. Chargeback (contestação de compra perdida): R$ 55. O reembolso da venda não tem custo extra, mas as taxas da transação original não são devolvidas." },
              { question: "Como funciona a cobrança de faturas da DelviFy?", answer: "A DelviFy não envia mais cobranças de faturas por e-mail ou WhatsApp. Todas as faturas digitais ficam disponíveis exclusivamente no seu Painel do Cliente (www.delvind.com) a partir do dia 1º de cada mês, com vencimento a partir do dia 5. Acordos de boletos com datas personalizadas serão mantidos." },
              { question: "Como faço para criar e enviar conteúdo (cursos, blogs)?", answer: "Para enviar ou criar conteúdo como cursos, produtos ou posts de blog, você deve acessar seu painel de administração. Lá, você encontrará o 'Studio de Cursos' e o 'Studio de Blog', ferramentas intuitivas para você gerenciar todo o seu conteúdo. Em caso de dúvidas, entre em contato conosco nos grupos corporativos específicos da sua empresa para alinharmos os detalhes." },
          ]
        }
      }]
    },
    contact: createDefaultPageData("Contato", "DefaultSection"),
    verify: createDefaultPageData("Verificação", "DefaultSection"),
    'privacy-policy': createDefaultPageData("Política de Privacidade", "DefaultSection"),
    'terms-of-use': createDefaultPageData("Termos de Uso", "DefaultSection"),
    'cookie-policy': createDefaultPageData("Política de Cookies", "DefaultSection"),
    'refund-policy': createDefaultPageData("Política de Reembolso", "DefaultSection"),
    'support-policy': createDefaultPageData("Política de Atendimento", "DefaultSection"),
    'copyright-policy': createDefaultPageData("Política de Direitos Autorais", "DefaultSection"),
};
