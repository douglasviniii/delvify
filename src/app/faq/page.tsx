

'use client';

import { useState } from 'react';
import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

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


export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container max-w-4xl px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Perguntas Frequentes (FAQ)</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Encontre aqui as respostas para as dúvidas mais comuns sobre nossa plataforma.
              </p>
              <div className="mt-8 relative max-w-2xl mx-auto">
                <Input 
                  placeholder="O que você está procurando?" 
                  className="h-12 text-lg pl-12 pr-4 rounded-full shadow-md border-2 border-transparent focus:border-primary transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg bg-card overflow-hidden">
                  <AccordionTrigger className="p-6 text-lg font-semibold text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0 text-muted-foreground text-base">
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }} />
                  </AccordionContent>
                </AccordionItem>
              )) : (
                <div className="text-center py-16 border rounded-lg">
                    <h2 className="text-xl font-semibold">Nenhum resultado encontrado.</h2>
                    <p className="text-muted-foreground mt-2">Tente uma busca diferente ou verifique todas as nossas perguntas.</p>
                </div>
              )}
            </Accordion>
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
