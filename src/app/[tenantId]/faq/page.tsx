

import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FaqPageSection } from '@/components/sections/FaqPageSection';
import { DefaultSection } from '@/components/sections/DefaultSection';

const initialFaqPageData = {
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
};

const SectionComponents: Record<string, React.FC<any>> = {
  FaqPageSection,
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
        return initialFaqPageData.sections || [];
    } catch (error) {
        console.error("Error fetching page sections, returning initial data:", error);
        return initialFaqPageData.sections || [];
    }
}


export default async function FAQPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const sections = await getPageSections(tenantId, 'faq');

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
