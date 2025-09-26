

'use server';

import { getAdminDb, serializeDoc as adminSerializeDoc } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { Post, Comment } from './types';

// Function to get all posts from a specific tenant
export async function getAllBlogPosts(tenantId: string, userId?: string): Promise<Post[]> {
  if (!tenantId) {
    console.error("Error: tenantId is required to fetch blog posts.");
    return [];
  }

  try {
    const adminDb = getAdminDb();
    const posts: Post[] = [];
    const postsQuery = adminDb.collection(`tenants/${tenantId}/blog`).orderBy('createdAt', 'desc');
    const querySnapshot = await postsQuery.get();
    
    for (const docRef of querySnapshot.docs) {
      const postData = adminSerializeDoc(docRef) as Post;
      
      const commentsSnapshot = await docRef.ref.collection('comments').get();
      const likesSnapshot = await docRef.ref.collection('likes').get();
      
      postData.commentCount = commentsSnapshot.size;
      postData.likeCount = likesSnapshot.size;

      if (userId) {
          const likeDoc = await docRef.ref.collection('likes').doc(userId).get();
          postData.isLikedByUser = likeDoc.exists;
      } else {
          postData.isLikedByUser = false;
      }
      
      posts.push(postData);
    }

    return posts;
  } catch (error: any) {
    console.error(`Error fetching blog posts for tenant ${tenantId}:`, error.message);
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
        const adminDb = getAdminDb();
        const postsCollectionRef = adminDb.collection(`tenants/${tenantId}/blog`);
        const q = postsCollectionRef.where('slug', '==', slug).limit(1);
        const snapshot = await q.get();

        if (snapshot.empty) {
            console.log(`No post found with slug: ${slug} for tenant: ${tenantId}`);
            return null;
        }
        
        const postDoc = snapshot.docs[0];
        return adminSerializeDoc(postDoc) as Post;

    } catch (error: any) {
        console.error(`Error fetching post with slug ${slug} for tenant ${tenantId}:`, error.message);
        return null;
    }
}

export async function getPostComments(tenantId: string, postId: string): Promise<Comment[]> {
    if (!tenantId || !postId) {
        return [];
    }
    try {
        const adminDb = getAdminDb();
        const comments: Comment[] = [];
        const commentsQuery = adminDb.collection(`tenants/${tenantId}/blog/${postId}/comments`).orderBy('createdAt', 'desc');
        const querySnapshot = await commentsQuery.get();

        querySnapshot.forEach(doc => {
            comments.push(adminSerializeDoc(doc) as Comment);
        });
        
        return comments;
    } catch(error: any) {
        console.error(`Error fetching comments for post ${postId}:`, error.message);
        return [];
    }
}
