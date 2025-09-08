import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Layers, Newspaper, Palette, ShieldCheck } from 'lucide-react';
import { MainHeader } from '@/components/main-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainFooter } from '@/components/main-footer';

const features = [
  {
    icon: <Layers className="h-8 w-8 text-primary" />,
    title: 'Arquitetura Multi-Inquilino',
    description: 'Isole e sirva conteúdo, marca e páginas de destino personalizadas com base no domínio.',
  },
  {
    icon: <Palette className="h-8 w-8 text-primary" />,
    title: 'Painel de Administração Específico do Inquilino',
    description: 'Gerencie cursos, marca e usuários com uma interface de administração dedicada, incluindo personalização com IA.',
  },
  {
    icon: <Newspaper className="h-8 w-8 text-primary" />,
    title: 'Motor de Blog',
    description: 'Compartilhe notícias e atualizações com uma plataforma de blog simples e integrada para cada domínio de inquilino.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Autenticação Segura de Usuário',
    description: 'Níveis de acesso separados para administradores e alunos com um sistema seguro de login e registro.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 top-0 -z-10 h-1/2 w-full bg-gradient-to-b from-primary/10 to-transparent"
          />
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                A Plataforma Completa para Criação de Cursos
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                DelviFy oferece uma solução robusta e multi-inquilino para construir, gerenciar e escalar seu negócio de educação online com facilidade.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/login">
                    Comece Gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#">Saber Mais</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Recursos Poderosos para a Educação Moderna
              </h2>
              <p className="mt-4 text-muted-foreground">
                Tudo que você precisa para criar uma plataforma de aprendizado online de sucesso.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                  Personalize Sua Plataforma com IA
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Use linguagem natural para personalizar instantaneamente a marca do seu inquilino. Nossa ferramenta de GenAI interpreta suas instruções para criar a aparência perfeita para o seu site.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/admin/settings">
                    Experimente a IA de Marca <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="https://picsum.photos/800/600"
                  alt="Personalização com IA"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="abstract technology"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
