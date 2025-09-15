
import { Suspense } from 'react';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import { Loader2 } from 'lucide-react';
import VerificationPageContent from './verify-client-content';


export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainHeader />
      <main className="flex-1 py-12 md:py-20">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <VerificationPageContent />
        </Suspense>
      </main>
      <MainFooter />
    </div>
  );
}