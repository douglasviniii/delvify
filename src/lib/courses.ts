

'use server';

import { getAdminDb, serializeDoc as adminSerializeDoc } from '@/lib/firebase-admin';
import type { Course, Module, Category, Review, PurchasedCourseInfo } from './types';


export async function getAllCourses(tenantId: string): Promise<Course[]> {
  if (!tenantId) {
    console.error("Error: tenantId is required to fetch courses.");
    return [];
  }
  try {
    const adminDb = getAdminDb();
    const courses: Course[] = [];
    const coursesQuery = adminDb.collection(`tenants/${tenantId}/courses`)
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc');
    
    const querySnapshot = await coursesQuery.get();
    
    querySnapshot.forEach((doc) => {
      const courseData = adminSerializeDoc(doc) as Omit<Course, 'tenantId'>;
      courses.push({ ...courseData, tenantId });
    });

    return courses;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
    console.error(`Error fetching courses for tenant ${tenantId}:`, errorMessage);
    return [];
  }
}


export async function getCourseById(tenantId: string, courseId: string): Promise<Course | null> {
    if (!tenantId || !courseId) {
        return null;
    }
    try {
        const adminDb = getAdminDb();
        const docRef = await adminDb.doc(`tenants/${tenantId}/courses/${courseId}`).get();
        if (docRef.exists) {
            const courseData = adminSerializeDoc(docRef) as Omit<Course, 'tenantId'>;
            return { ...courseData, tenantId };
        }
        return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
      console.error(`Error fetching course ${courseId} for tenant ${tenantId}:`, errorMessage);
      return null;
    }
}

export async function getCourseModules(tenantId: string, courseId: string): Promise<Module[]> {
    if (!tenantId || !courseId) {
        return [];
    }
    try {
        const adminDb = getAdminDb();
        const modules: Module[] = [];
        const modulesQuery = adminDb.collection(`tenants/${tenantId}/courses/${courseId}/modules`).orderBy('order');
        const querySnapshot = await modulesQuery.get();

        querySnapshot.forEach(doc => {
            modules.push(adminSerializeDoc(doc) as Module);
        });

        return modules;
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error(`Error fetching modules for course ${courseId}:`, errorMessage);
        return [];
    }
}

export async function getAllCategories(tenantId: string): Promise<Category[]> {
    if (!tenantId) {
        return [];
    }
    try {
        const adminDb = getAdminDb();
        const categories: Category[] = [];
        const catQuery = adminDb.collection(`tenants/${tenantId}/categories`).orderBy('name');
        const querySnapshot = await catQuery.get();
        querySnapshot.forEach(doc => {
            categories.push(adminSerializeDoc(doc) as Category);
        })
        return categories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
      console.error(`Error fetching categories for tenant ${tenantId}:`, errorMessage);
      return [];
    }
}

export async function getCourseReviews(tenantId: string, courseId: string): Promise<Review[]> {
    if (!tenantId || !courseId) {
        return [];
    }
    try {
        const adminDb = getAdminDb();
        const reviews: Review[] = [];
        const reviewsQuery = adminDb.collection(`tenants/${tenantId}/courses/${courseId}/reviews`).orderBy('createdAt', 'desc');
        const querySnapshot = await reviewsQuery.get();

        querySnapshot.forEach(doc => {
            reviews.push(adminSerializeDoc(doc) as Review);
        });

        return reviews;
    } catch(error) {
      const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
      console.error(`Error fetching reviews for course ${courseId}:`, errorMessage);
      return [];
    }
}

export async function hasPurchasedCourse(userId: string, courseId: string): Promise<boolean> {
    if (!userId || !courseId) return false;
    try {
        const adminDb = getAdminDb();
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDocSnap = await userDocRef.get();
        if (userDocSnap.exists) {
            const data = userDocSnap.data();
            return !!(data && data.purchasedCourses && data.purchasedCourses[courseId]);
        }
        return false;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error(`Error checking purchase status for user ${userId}, course ${courseId}:`, errorMessage);
        return false;
    }
}


export async function getPurchasedCourses(userId: string): Promise<{ courses: Course[], details: Record<string, PurchasedCourseInfo> }> {
    if (!userId) return { courses: [], details: {} };
    try {
        const adminDb = getAdminDb();
        const userDocRef = await adminDb.collection('users').doc(userId).get();
        if (!userDocRef.exists) return { courses: [], details: {} };

        const userData = adminSerializeDoc(userDocRef);
        if (!userData || !userData.purchasedCourses) {
            return { courses: [], details: {} };
        }

        const purchasedCoursesMap = userData.purchasedCourses as Record<string, PurchasedCourseInfo>;
        const coursePromises: Promise<Course | null>[] = Object.keys(purchasedCoursesMap).map(courseId => {
            const tenantId = purchasedCoursesMap[courseId].tenantId;
            return getCourseById(tenantId, courseId); 
        });

        const courses = await Promise.all(coursePromises);
        const validCourses = courses.filter((course): course is Course => course !== null);
        
        return { courses: validCourses, details: purchasedCoursesMap };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error(`Error fetching purchased courses for user ${userId}:`, errorMessage);
        return { courses: [], details: {} };
    }
}

export async function getPurchasedCourseDetails(userId: string): Promise<Record<string, PurchasedCourseInfo>> {
    if (!userId) return {};
    try {
        const adminDb = getAdminDb();
        const userDocRef = await adminDb.collection('users').doc(userId).get();
        if (!userDocRef.exists()) return {};

        const userData = adminSerializeDoc(userDocRef);

        if (!userData || !userData.purchasedCourses) {
            return {};
        }

        return userData.purchasedCourses as Record<string, PurchasedCourseInfo>;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error(`Error fetching purchased course details for user ${userId}:`, errorMessage);
        return {};
    }
}
