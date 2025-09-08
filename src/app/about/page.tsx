
import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { getGlobalSettingsForTenant } from '@/lib/settings';
import Image from 'next/image';
import { Building, Target, Users } from 'lucide-react';

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function AboutPage() {
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader settings={settings} />
      <main className="flex-1">
        <section className="py-12 md:py-20 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl">Sobre a DelviFy</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Inovando o futuro da educação online com tecnologia de ponta e paixão por ensinar e aprender.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
            <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                        <h2 className="font-headline text-3xl font-bold">Nossa História</h2>
                        <p className="text-muted-foreground text-lg">
                            A DelviFy é uma marca da Delvind Tecnologia Da Informação LTDA. Somos uma startup de tecnologia focada em oferecer soluções inovadoras para educação online. Nossa plataforma permite que criadores de conteúdo e empresas construam, gerenciem e escalem seus negócios de cursos online através de uma arquitetura robusta, segura e multi-inquilino.
                        </p>
                        <p className="text-muted-foreground text-lg">
                            Nascemos da visão de democratizar o acesso à tecnologia de ponta para educadores, permitindo que eles se concentrem no que fazem de melhor: criar conteúdo de qualidade.
                        </p>
                    </div>
                    <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src="https://picsum.photos/800/600?random=office"
                            alt="Escritório da DelviFy"
                            fill
                            className="object-cover"
                            data-ai-hint="office team"
                        />
                    </div>
                </div>
            </div>
        </section>

        <section className="py-12 md:py-20 bg-secondary/50">
            <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-3">
                        <Target className="h-12 w-12 mx-auto text-primary" />
                        <h3 className="font-headline text-2xl font-bold">Nossa Missão</h3>
                        <p className="text-muted-foreground">
                            Empoderar criadores de conteúdo com ferramentas poderosas e fáceis de usar para que possam construir negócios de educação online de sucesso e impacto.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Building className="h-12 w-12 mx-auto text-primary" />
                        <h3 className="font-headline text-2xl font-bold">Nossa Visão</h3>
                        <p className="text-muted-foreground">
                            Ser a plataforma de referência na América Latina para a criação e gestão de ecossistemas de aprendizagem online, reconhecida pela inovação e parceria com nossos clientes.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Users className="h-12 w-12 mx-auto text-primary" />
                        <h3 className="font-headline text-2xl font-bold">Nossos Valores</h3>
                        <p className="text-muted-foreground">
                            Inovação contínua, sucesso do cliente em primeiro lugar, transparência, colaboração e paixão por educação.
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
