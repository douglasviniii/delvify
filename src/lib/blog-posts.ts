

'use server';

import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAdminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { Post, Comment } from './types';

const serializeDoc = (doc: any): any => {
    const data = doc.data();
    if (!data) {
        return { id: doc.id };
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
    const postsQuery = query(collection(db, `tenants/${tenantId}/blog`), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(postsQuery);
    
    for (const docRef of querySnapshot.docs) {
      const postData = serializeDoc(docRef) as Post;
      
      const commentsSnapshot = await getDocs(collection(db, `tenants/${tenantId}/blog/${docRef.id}/comments`));
      const likesSnapshot = await getDocs(collection(db, `tenants/${tenantId}/blog/${docRef.id}/likes`));
      
      postData.commentCount = commentsSnapshot.size;
      postData.likeCount = likesSnapshot.size;

      if (userId) {
          const likeDocRef = doc(db, `tenants/${tenantId}/blog/${docRef.id}/likes`, userId);
          const likeDoc = await getDoc(likeDocRef);
          postData.isLikedByUser = likeDoc.exists();
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
        const postsCollectionRef = collection(db, `tenants/${tenantId}/blog`);
        const q = query(postsCollectionRef, where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log(`No post found with slug: ${slug} for tenant: ${tenantId}`);
            return null;
        }
        
        const postDoc = snapshot.docs[0];
        return serializeDoc(postDoc) as Post;

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
        const comments: Comment[] = [];
        const commentsQuery = query(collection(db, `tenants/${tenantId}/blog/${postId}/comments`), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(commentsQuery);

        querySnapshot.forEach(doc => {
            comments.push(serializeDoc(doc) as Comment);
        });
        
        return comments;
    } catch(error: any) {
        console.error(`Error fetching comments for post ${postId}:`, error.message);
        return [];
    }
}
