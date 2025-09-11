
'use server';

import { adminDb } from './firebase-admin';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase'; // Client SDK

export type Course = {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  price: string;
  promotionalPrice?: string;
  category: string;
  tag?: string;
  coverImageUrl: string;
  contentType: 'video' | 'pdf';
  status: 'draft' | 'published';
  createdAt: string; 
  updatedAt?: string;
};

export type Module = {
    id: string;
    title: string;
    description?: string;
    contentUrl: string;
    order: number;
}

export type Category = {
    id: string;
    name: string;
}

export type Review = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const serializeDoc = (doc: FirebaseFirestore.DocumentSnapshot): any => {
    const data = doc.data();
    if (!data) {
        throw new Error(`Document with id ${doc.id} has no data.`);
    }
    const docData: { [key: string]: any } = { id: doc.id, ...data };
    
    for (const key in docData) {
      if (docData[key] && typeof docData[key].toDate === 'function') {
        docData[key] = docData[key].toDate().toISOString();
      }
    }
    return docData;
}


export async function getAllCourses(tenantId: string): Promise<Course[]> {
  if (!tenantId) {
    console.error("Error: tenantId is required to fetch courses.");
    return [];
  }
  try {
    const courses: Course[] = [];
    const coursesQuery = adminDb.collection(`tenants/${tenantId}/courses`).where('status', '==', 'published').orderBy('createdAt', 'desc');
    const querySnapshot = await coursesQuery.get();
    
    querySnapshot.forEach((doc) => {
      const courseData = serializeDoc(doc) as Omit<Course, 'tenantId'>;
      courses.push({ ...courseData, tenantId });
    });

    return courses;
  } catch (error) {
    console.error(`Error fetching courses for tenant ${tenantId}:`, error);
    return [];
  }
}


export async function getCourseById(tenantId: string, courseId: string): Promise<Course | null> {
    if (!tenantId || !courseId) {
        return null;
    }
    try {
        const docRef = await adminDb.doc(`tenants/${tenantId}/courses/${courseId}`).get();
        if (docRef.exists) {
            const courseData = serializeDoc(docRef) as Omit<Course, 'tenantId'>;
            return { ...courseData, tenantId };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching course ${courseId} for tenant ${tenantId}:`, error);
        return null;
    }
}

export async function getCourseModules(tenantId: string, courseId: string): Promise<Module[]> {
    if (!tenantId || !courseId) {
        return [];
    }
    try {
        const modules: Module[] = [];
        const modulesQuery = adminDb.collection(`tenants/${tenantId}/courses/${courseId}/modules`).orderBy('order');
        const querySnapshot = await modulesQuery.get();

        querySnapshot.forEach(doc => {
            modules.push(serializeDoc(doc) as Module);
        });

        return modules;
    } catch(error) {
        console.error(`Error fetching modules for course ${courseId}:`, error);
        return [];
    }
}

export async function getAllCategories(tenantId: string): Promise<Category[]> {
    if (!tenantId) {
        return [];
    }
    try {
        const categories: Category[] = [];
        const catQuery = adminDb.collection(`tenants/${tenantId}/categories`).orderBy('name');
        const querySnapshot = await catQuery.get();
        querySnapshot.forEach(doc => {
            categories.push(serializeDoc(doc) as Category);
        })
        return categories;
    } catch (error) {
        console.error(`Error fetching categories for tenant ${tenantId}:`, error);
        return [];
    }
}

export async function getCourseReviews(tenantId: string, courseId: string): Promise<Review[]> {
    if (!tenantId || !courseId) {
        return [];
    }
    try {
        const reviews: Review[] = [];
        const reviewsQuery = adminDb.collection(`tenants/${tenantId}/courses/${courseId}/reviews`).orderBy('createdAt', 'desc');
        const querySnapshot = await reviewsQuery.get();

        querySnapshot.forEach(doc => {
            reviews.push(serializeDoc(doc) as Review);
        });

        return reviews;
    } catch(error) {
        console.error(`Error fetching reviews for course ${courseId}:`, error);
        return [];
    }
}

export async function hasPurchasedCourse(userId: string, courseId: string): Promise<boolean> {
    if (!userId || !courseId) return false;
    try {
        const userDocRef = doc(db, 'users', userId); // Use client SDK for this check
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            return !!(data.purchasedCourses && data.purchasedCourses[courseId]);
        }
        return false;
    } catch (error) {
        console.error(`Error checking purchase status for user ${userId}, course ${courseId}:`, error);
        return false;
    }
}

export async function getPurchasedCourses(userId: string): Promise<Course[]> {
    if (!userId) return [];
    try {
        const userDocRef = await adminDb.collection('users').doc(userId).get();
        const userData = userDocRef.data();
        if (!userData || !userData.purchasedCourses) {
            return [];
        }

        const purchasedCoursesMap = userData.purchasedCourses;
        const coursePromises: Promise<Course | null>[] = Object.keys(purchasedCoursesMap).map(courseId => {
            const tenantId = purchasedCoursesMap[courseId].tenantId;
            return getCourseById(tenantId, courseId);
        });

        const courses = await Promise.all(coursePromises);
        return courses.filter((course): course is Course => course !== null);
    } catch (error) {
        console.error(`Error fetching purchased courses for user ${userId}:`, error);
        return [];
    }
}
