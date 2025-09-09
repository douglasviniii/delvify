
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

const serializePost = (doc: FirebaseFirestore.DocumentSnapshot): Post => {
    const data = doc.data();
    if (!data) {
        throw new Error(`Document with id ${doc.id} has no data.`);
    }
    const docData: { [key: string]: any } = { id: doc.id, ...data };
    
    // Ensure all timestamp fields are converted to ISO strings
    for (const key in docData) {
      if (docData[key] && typeof docData[key].toDate === 'function') {
        docData[key] = docData[key].toDate().toISOString();
      }
    }

    return docData as Post;
}

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
      posts.push(serializePost(doc));
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
        const postsCollectionRef = adminDb.collection(`tenants/${tenantId}/blog`);
        // Firestore queries with 'where' clauses on different fields might require a composite index.
        // If this query fails due to a missing index, a fallback to fetching all and filtering is needed.
        // For now, we assume the simple index on 'slug' is sufficient or will be auto-created.
        const q = postsCollectionRef.where('slug', '==', slug).limit(1);
        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            console.log(`No post found with slug: ${slug} for tenant: ${tenantId}`);
            return null;
        }
        
        const postDoc = querySnapshot.docs[0];
        return serializePost(postDoc);

    } catch (error) {
        console.error(`Error fetching post with slug ${slug} for tenant ${tenantId}:`, error);
        // Fallback for cases where the query fails (e.g., missing index)
        console.log("Fallback: Fetching all posts and filtering by slug.");
        const allPosts = await getAllBlogPosts(tenantId);
        const post = allPosts.find(p => p.slug === slug);
        return post || null;
    }
}
