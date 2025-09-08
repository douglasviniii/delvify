

import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { getGlobalSettingsForTenant } from '@/lib/settings';
import FaqClientContent from './faq-client-content';

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const faqData = [
  {
    question: "Como funcionam os repasses financeiros?",
    answer: "Os repasses dos valores de vendas ocorrem uma vez por mês. O valor transferido para a conta bancária fornecida pela sua empresa já é líquido, ou seja, com todos os impostos devidos já retidos. Você pode acompanhar todas as vendas, valores a receber e relatórios completos em tempo real através do seu painel de controle (dashboard) na plataforma."
  },
  {
    question: "Quais são as taxas da plataforma?",
    answer: "Nossa estrutura de taxas é dividida em duas partes: a taxa da intermediadora de pagamentos (Stripe) e a taxa de administração da DelviFy. É importante entender que a DelviFy não define as taxas da Stripe; elas são custos da 'maquininha de cartão virtual' que garante a segurança das transações. Além disso, há uma taxa de 9% da DelviFy por venda, que cobre os custos de infraestrutura, manutenção e administração financeira da plataforma, substituindo uma mensalidade fixa."
  },
  {
    question: "Quais são as taxas da intermediadora Stripe?",
    answer: "A Stripe, nossa parceira para processamento de pagamentos, aplica as seguintes taxas sobre as transações: Cartão de crédito/débito nacional: 3,99% + R$ 0,39 por venda. Cartão internacional: 3,99% + R$ 0,39 + 2% de conversão. PIX: 1,19% por venda. Boleto: R$ 3,45 por boleto pago. Chargeback (contestação de compra perdida): R$ 55. O reembolso da venda não tem custo extra, mas as taxas da transação original não são devolvidas."
  },
  {
    question: "Como funciona a cobrança de faturas da DelviFy?",
    answer: "A DelviFy não envia mais cobranças de faturas por e-mail ou WhatsApp. Todas as faturas digitais ficam disponíveis exclusivamente no seu Painel do Cliente (www.delvind.com) a partir do dia 1º de cada mês, com vencimento a partir do dia 5. Acordos de boletos com datas personalizadas serão mantidos."
  },
  {
    question: "Como faço para criar e enviar conteúdo (cursos, blogs)?",
    answer: "Para enviar ou criar conteúdo como cursos, produtos ou posts de blog, você deve acessar seu painel de administração. Lá, você encontrará o 'Studio de Cursos' e o 'Studio de Blog', ferramentas intuitivas para você gerenciar todo o seu conteúdo. Em caso de dúvidas, entre em contato conosco nos grupos corporativos específicos da sua empresa para alinharmos os detalhes."
  },
  {
    question: "Quem é a DelviFy?",
    answer: "A DelviFy é uma marca da Delvind Tecnologia Da Informação LTDA. Somos uma startup de tecnologia focada em oferecer soluções inovadoras para educação online. Nossa plataforma permite que criadores de conteúdo e empresas construam, gerenciem e escalem seus negócios de cursos online através de uma arquitetura robusta, segura e multi-inquilino."
  },
  {
    question: "Preciso pagar mensalidade para usar a plataforma?",
    answer: "Não. Em vez de uma mensalidade fixa, nosso modelo de negócio é baseado em uma taxa de 9% sobre cada venda realizada. Isso significa que você só paga quando vende, alinhando nossos objetivos com o seu sucesso. Essa taxa cobre todos os custos de manutenção, banco de dados, infraestrutura e administração financeira da plataforma."
  }
];


export default async function FAQPage() {
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader settings={settings} />
      <main className="flex-1">
        <FaqClientContent faqData={faqData} />
      </main>
      <MainFooter />
    </div>
  );
}

