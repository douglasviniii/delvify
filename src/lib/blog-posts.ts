
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


// Function to get all posts from all tenants
export async function getAllBlogPosts(): Promise<Post[]> {
  try {
    const posts: Post[] = [];
    const postsQuery = adminDb.collectionGroup('blog');
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

    // Sort by creation date descending
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return posts;
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return [];
  }
}

// Function to get a single post by its slug from any tenant
export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const postsQuery = adminDb.collectionGroup('blog').where('slug', '==', slug).limit(1);
        const querySnapshot = await postsQuery.get();

        if (querySnapshot.empty) {
            console.log(`No post found with slug: ${slug}`);
            return null;
        }

        const postDoc = querySnapshot.docs[0];
        const data = postDoc.data();
        const docData: { [key: string]: any } = { id: postDoc.id, ...data };

        // Ensure all timestamp fields are converted to ISO strings
        for (const key in docData) {
            if (docData[key] && typeof docData[key].toDate === 'function') {
            docData[key] = docData[key].toDate().toISOString();
            }
        }

        return docData as Post;

    } catch (error) {
        console.error(`Error fetching post with slug ${slug}:`, error);
        return null;
    }
}

    