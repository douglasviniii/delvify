

'use server';

import { adminDb } from './firebase-admin';
import { getAuth } from 'firebase-admin/auth';

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
  commentCount?: number; 
  likeCount?: number;
  isLikedByUser?: boolean;
};

export type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string;
    text: string;
    createdAt: string;
    likes: number;
}

const serializeDoc = (doc: FirebaseFirestore.DocumentSnapshot): any => {
    const data = doc.data();
    if (!data) {
        throw new Error(`Document with id ${doc.id} has no data.`);
    }
    // Explicitly include the slug which is part of the data object
    const docData: { [key: string]: any } = { id: doc.id, ...data };
    
    // Ensure all timestamp fields are converted to ISO strings
    for (const key in docData) {
      if (docData[key] && typeof docData[key].toDate === 'function') {
        docData[key] = docData[key].toDate().toISOString();
      }
    }

    return docData;
}

// Function to get all posts from a specific tenant
export async function getAllBlogPosts(tenantId: string, userId?: string): Promise<Post[]> {
  if (!tenantId) {
    console.error("Error: tenantId is required to fetch blog posts.");
    return [];
  }

  try {
    const posts: Post[] = [];
    const postsQuery = adminDb.collection(`tenants/${tenantId}/blog`).orderBy('createdAt', 'desc');
    const querySnapshot = await postsQuery.get();
    
    for (const doc of querySnapshot.docs) {
      const postData = serializeDoc(doc) as Post;
      
      const commentsSnapshot = await adminDb.collection(`tenants/${tenantId}/blog/${doc.id}/comments`).get();
      const likesSnapshot = await adminDb.collection(`tenants/${tenantId}/blog/${doc.id}/likes`).get();
      
      postData.commentCount = commentsSnapshot.size;
      postData.likeCount = likesSnapshot.size;

      if (userId) {
          const likeDoc = await adminDb.collection(`tenants/${tenantId}/blog/${doc.id}/likes`).doc(userId).get();
          postData.isLikedByUser = likeDoc.exists;
      } else {
          postData.isLikedByUser = false;
      }
      
      posts.push(postData);
    }

    return posts;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching blog posts for tenant ${tenantId}:`, errorMessage);
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
        const snapshot = await postsCollectionRef.where('slug', '==', slug).limit(1).get();

        if (snapshot.empty) {
            console.log(`No post found with slug: ${slug} for tenant: ${tenantId}`);
            return null;
        }
        
        const postDoc = snapshot.docs[0];
        return serializeDoc(postDoc) as Post;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error fetching post with slug ${slug} for tenant ${tenantId}:`, errorMessage);
        // Fallback for environments where indexes might not be configured.
        // This is less efficient but more robust.
        try {
            console.log(`Falling back to manual search for slug: ${slug}`);
            const allPosts = await getAllBlogPosts(tenantId);
            const post = allPosts.find(p => p.slug === slug);
            return post || null;
        } catch (fallbackError) {
            const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
            console.error(`Fallback search also failed for slug ${slug}:`, fallbackErrorMessage);
            return null;
        }
    }
}

export async function getPostComments(tenantId: string, postId: string): Promise<Comment[]> {
    if (!tenantId || !postId) {
        return [];
    }
    try {
        const comments: Comment[] = [];
        const commentsQuery = adminDb.collection(`tenants/${tenantId}/blog/${postId}/comments`).orderBy('createdAt', 'desc');
        const querySnapshot = await commentsQuery.get();

        querySnapshot.forEach(doc => {
            comments.push(serializeDoc(doc) as Comment);
        });
        
        return comments;
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error fetching comments for post ${postId}:`, errorMessage);
        return [];
    }
}
