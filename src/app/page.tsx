
import { MainHeader } from '@/components/main-header';
import { MainFooter } from '@/components/main-footer';
import { HeroSection, FeaturesSection, AiCustomizationSection, CoursesSection, LatestPostsSection } from '@/components/page-sections';
import { homePageData } from '@/lib/page-data';
import { getAllBlogPosts } from '@/lib/blog-posts';

// This is the main tenant ID for the public-facing website.
// In a real multi-domain app, you would resolve this based on the request's hostname.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function Home() {
  const latestPosts = await getAllBlogPosts(MAIN_TENANT_ID);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex-1">
        {/* Render sections directly instead of mapping */}
        <HeroSection settings={homePageData.hero.settings} />
        <FeaturesSection settings={homePageData.features.settings} />
        <AiCustomizationSection settings={homePageData.aiCustomization.settings} />

        {/* These sections are self-contained for now */}
        <CoursesSection />
        <LatestPostsSection posts={latestPosts.slice(0, 4)} />
      </main>
      <MainFooter />
    </div>
  );
}
