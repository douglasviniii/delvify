import { redirect } from 'next/navigation';
import { defaultLocale } from '@/middleware';

// This page will be the destination for the root path of each language.
// e.g. / or /pt will land here.
// We redirect to the login page for that language.
export default function LangRootPage({ params }: { params: { lang: string } }) {
  redirect(`/${params.lang || defaultLocale}/login`);
}
