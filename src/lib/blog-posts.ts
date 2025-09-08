
import { adminDb } from './firebase-admin';
import { collectionGroup, getDocs, query, where, limit } from 'firebase/firestore';

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
  createdAt: any; // Firestore timestamp
};


// Function to get all posts from all tenants
export async function getAllBlogPosts(): Promise<Post[]> {
  try {
    const posts: Post[] = [];
    const postsQuery = query(collectionGroup(adminDb, 'blog'));
    const querySnapshot = await getDocs(postsQuery);
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });

    // Sort by creation date descending
    posts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return posts;
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return [];
  }
}

// Function to get a single post by its slug from any tenant
export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const postsQuery = query(
            collectionGroup(adminDb, 'blog'), 
            where('slug', '==', slug),
            limit(1)
        );
        const querySnapshot = await getDocs(postsQuery);

        if (querySnapshot.empty) {
            console.log(`No post found with slug: ${slug}`);
            return null;
        }

        const postDoc = querySnapshot.docs[0];
        return { id: postDoc.id, ...postDoc.data() } as Post;

    } catch (error) {
        console.error(`Error fetching post with slug ${slug}:`, error);
        return null;
    }
}

    