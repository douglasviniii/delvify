

'use server';

import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase'; // Client SDK
import type { Course, Module, Category, Review, PurchasedCourseInfo } from './types';

// Função de serialização robusta para garantir que todos os Timestamps, incluindo os aninhados, sejam convertidos.
const serializeData = (data: any): any => {
    if (data === null || typeof data !== 'object') {
        return data;
    }
    if (data.toDate && typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(serializeData);
    }
    const serializedObject: { [key: string]: any } = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            serializedObject[key] = serializeData(data[key]);
        }
    }
    return serializedObject;
};

const serializeDoc = (doc: any): any => {
    const data = doc.data();
    if (!data) {
        return { id: doc.id };
    }
    const docData = { id: doc.id, ...data };
    return serializeData(docData);
}


export async function getAllCourses(tenantId: string): Promise<Course[]> {
  if (!tenantId) {
    console.error("Error: tenantId is required to fetch courses.");
    return [];
  }
  try {
    const courses: Course[] = [];
    const coursesQuery = query(
        collection(db, `tenants/${tenantId}/courses`), 
        where('status', '==', 'published'), 
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(coursesQuery);
    
    querySnapshot.forEach((doc) => {
      const courseData = serializeDoc(doc) as Omit<Course, 'tenantId'>;
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
        const docRef = await getDoc(doc(db, `tenants/${tenantId}/courses`, courseId));
        if (docRef.exists()) {
            const courseData = serializeDoc(docRef) as Omit<Course, 'tenantId'>;
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
        const modules: Module[] = [];
        const modulesQuery = query(collection(db, `tenants/${tenantId}/courses/${courseId}/modules`), orderBy('order'));
        const querySnapshot = await getDocs(modulesQuery);

        querySnapshot.forEach(doc => {
            modules.push(serializeDoc(doc) as Module);
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
        const categories: Category[] = [];
        const catQuery = query(collection(db, `tenants/${tenantId}/categories`), orderBy('name'));
        const querySnapshot = await getDocs(catQuery);
        querySnapshot.forEach(doc => {
            categories.push(serializeDoc(doc) as Category);
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
        const reviews: Review[] = [];
        const reviewsQuery = query(collection(db, `tenants/${tenantId}/courses/${courseId}/reviews`), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(reviewsQuery);

        querySnapshot.forEach(doc => {
            reviews.push(serializeDoc(doc) as Review);
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
        const userDocRef = doc(db, 'users', userId); // Use client SDK for this check
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            return !!(data.purchasedCourses && data.purchasedCourses[courseId]);
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
        const userDocRef = await getDoc(doc(db, 'users', userId));
        if (!userDocRef.exists()) return { courses: [], details: {} };

        // A serialização robusta agora garante que todos os Timestamps aninhados sejam convertidos
        const userData = serializeDoc(userDocRef);
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

// A função getPurchasedCourseDetails é redundante agora que getPurchasedCourses retorna os detalhes.
// Pode ser removida no futuro para simplificar, mas mantida por enquanto para não quebrar outras partes que possam usá-la.
export async function getPurchasedCourseDetails(userId: string): Promise<Record<string, PurchasedCourseInfo>> {
    if (!userId) return {};
    try {
        const userDocRef = await getDoc(doc(db, 'users', userId));
        if (!userDocRef.exists()) return {};

        const userData = serializeDoc(userDocRef);

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
