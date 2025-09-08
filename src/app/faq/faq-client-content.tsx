
'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqClientContentProps {
  faqData: FaqItem[];
}

export default function FaqClientContent({ faqData }: FaqClientContentProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
  );
}
