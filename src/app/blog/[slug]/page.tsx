
// This file is obsolete because the route is now dynamic.
// It can be deleted, but we'll leave it for now.
// The new active file is /src/app/[tenantId]/blog/[slug]/page.tsx
import { redirect } from 'next/navigation';

export default function BlogPostPage() {
  redirect('/');
}
