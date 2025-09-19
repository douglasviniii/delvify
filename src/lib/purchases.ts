

'use server';

import { getAdminDb } from './firebase-admin';
import type { Purchase, PurchasedCourseInfo, Course } from './types';
import { collection, getDocs, doc, getDoc, query, orderBy, where, collectionGroup } from 'firebase/firestore';
import { db, serializeDoc } from './firebase';


export async function getPurchaseHistory(userId: string): Promise<Purchase[]> {
    if (!userId) {
        console.error("User ID is required to fetch purchase history.");
        return [];
    }

    try {
        const adminDb = getAdminDb();
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return [];
        }

        const userData = userDoc.data();
        if (!userData || !userData.purchasedCourses) {
            return [];
        }

        const purchasedCoursesInfo: Record<string, PurchasedCourseInfo> = userData.purchasedCourses;
        const tenantIds = new Set<string>(Object.values(purchasedCoursesInfo).map(info => info.tenantId));

        const allPurchases: Purchase[] = [];

        for (const tenantId of Array.from(tenantIds)) {
            const purchasesQuery = adminDb.collection(`tenants/${tenantId}/purchases`)
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc');
            
            const querySnapshot = await purchasesQuery.get();

            for (const doc of querySnapshot.docs) {
                const purchaseData = serializeDoc(doc) as Purchase;
                purchaseData.tenantId = tenantId;
                
                try {
                    const courseRef = await adminDb.doc(`tenants/${tenantId}/courses/${purchaseData.courseId}`).get();
                    if(courseRef.exists) {
                        purchaseData.courseTitle = courseRef.data()?.title || 'Curso não encontrado';
                    } else {
                        purchaseData.courseTitle = 'Curso não encontrado';
                    }
                } catch (courseError) {
                     const errorMessage = courseError instanceof Error ? courseError.message : 'Um erro desconhecido ocorreu.';
                    console.error(`Could not fetch course title for courseId ${purchaseData.courseId}`, errorMessage);
                    purchaseData.courseTitle = 'Detalhes do curso indisponíveis';
                }

                allPurchases.push(purchaseData);
            }
        }
        
        allPurchases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return allPurchases;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
        console.error(`Error fetching purchase history for user ${userId}:`, errorMessage);
        return [];
    }
}


export async function getAllPurchases(): Promise<Purchase[]> {
    try {
        const adminDb = getAdminDb();
        const purchasesCol = collectionGroup(adminDb, 'purchases');
        const purchasesSnapshot = await getDocs(purchasesCol);
        
        const allPurchases: Purchase[] = [];
        const courseCache = new Map<string, Course>();

        for (const purchaseDoc of purchasesSnapshot.docs) {
            const purchase = serializeDoc(purchaseDoc) as Omit<Purchase, 'tenantId' | 'courseTitle'>;
            const tenantId = purchaseDoc.ref.parent.parent?.id;

            if (tenantId) {
                let courseTitle = 'Curso não encontrado';
                const courseCacheKey = `${tenantId}-${purchase.courseId}`;
                
                if (courseCache.has(courseCacheKey)) {
                    courseTitle = courseCache.get(courseCacheKey)?.title || 'Curso não encontrado';
                } else {
                    const courseRef = doc(db, `tenants/${tenantId}/courses/${purchase.courseId}`);
                    const courseSnap = await getDoc(courseRef);
                    if (courseSnap.exists()) {
                        const courseData = courseSnap.data() as Course;
                        courseCache.set(courseCacheKey, courseData);
                        courseTitle = courseData.title;
                    }
                }
                
                allPurchases.push({ ...purchase, tenantId, courseTitle });
            }
        }
        
        return allPurchases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
        console.error('Error fetching all purchases:', errorMessage);
        return [];
    }
}

export async function getTenantPurchases(tenantId: string): Promise<Purchase[]> {
    if (!tenantId) {
        console.error("Tenant ID is required to fetch purchases.");
        return [];
    }
    try {
        const adminDb = getAdminDb();
        const purchasesQuery = query(collection(adminDb, `tenants/${tenantId}/purchases`), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(purchasesQuery);
        
        const purchases: Purchase[] = [];
        for(const doc of querySnapshot.docs) {
            purchases.push(serializeDoc(doc) as Purchase);
        }
        return purchases;
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
        console.error(`Error fetching purchases for tenant ${tenantId}:`, errorMessage);
        return [];
    }
}
