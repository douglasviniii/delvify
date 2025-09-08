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
    title: 'Multi-Tenant Architecture',
    description: 'Isolate and serve unique content, branding, and customized landing pages based on the domain.',
  },
  {
    icon: <Palette className="h-8 w-8 text-primary" />,
    title: 'Tenant-Specific Admin Panel',
    description: 'Manage courses, branding, and users with a dedicated admin interface, including AI-powered customization.',
  },
  {
    icon: <Newspaper className="h-8 w-8 text-primary" />,
    title: 'Blog Engine',
    description: 'Share news and updates with a simple, integrated blogging platform for each tenant domain.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Secure User Authentication',
    description: 'Separate access levels for admins and students with a secure login and registration system.',
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
                The All-in-One Platform for Course Creation
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                DelviFy provides a robust, multi-tenant solution to build, manage, and scale your online education business with ease.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/admin/dashboard">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Admin Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Powerful Features for Modern Education
              </h2>
              <p className="mt-4 text-muted-foreground">
                Everything you need to create a successful online learning platform.
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
                  Customize Your Platform with AI
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Use natural language to instantly customize your tenant&apos;s branding. Our GenAI tool interprets your instructions to create the perfect look and feel for your site.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/admin/settings">
                    Try Branding AI <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="https://picsum.photos/800/600"
                  alt="AI Customization"
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
