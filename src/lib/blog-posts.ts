
'use server';

import { adminDb } from './firebase-admin';

// This type definition needs to be maintained in sync with the one in admin/blog/page.tsx
export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  authorId: string;
  createdAt: string; // Serialized as ISO string
  updatedAt?: string; // Serialized as ISO string
};

// Function to get all posts from a specific tenant
export async function getAllBlogPosts(tenantId: string): Promise<Post[]> {
  if (!tenantId) {
    console.error("Error: tenantId is required to fetch blog posts.");
    return [];
  }

  try {
    const posts: Post[] = [];
    const postsQuery = adminDb.collection(`tenants/${tenantId}/blog`).orderBy('createdAt', 'desc');
    const querySnapshot = await postsQuery.get();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const docData: { [key: string]: any } = { id: doc.id, ...data };
      
      // Ensure all timestamp fields are converted to ISO strings
      for (const key in docData) {
        if (docData[key] && typeof docData[key].toDate === 'function') {
          docData[key] = docData[key].toDate().toISOString();
        }
      }

      posts.push(docData as Post);
    });

    return posts;
  } catch (error) {
    console.error(`Error fetching blog posts for tenant ${tenantId}:`, error);
    return [];
  }
}

// Function to get a single post by its slug from a specific tenant
export async function getPostBySlug(tenantId: string, slug: string): Promise<Post | null> {
    if (!tenantId) {
      console.error("Error: tenantId is required to fetch a blog post by slug.");
      return null;
    }
    
    try {
        // Firestore queries with 'where' clauses on different fields require a composite index.
        // To avoid manual index creation, we fetch all posts and filter in memory.
        // This is acceptable for a reasonable number of posts but might need optimization for very large blogs.
        const allPosts = await getAllBlogPosts(tenantId);
        const post = allPosts.find(p => p.slug === slug);

        if (!post) {
            console.log(`No post found with slug: ${slug} for tenant: ${tenantId}`);
            return null;
        }
        
        // The post object from getAllBlogPosts already has serialized timestamps.
        return post;

    } catch (error) {
        console.error(`Error fetching post with slug ${slug} for tenant ${tenantId}:`, error);
        return null;
    }
}
