

'use server';

import { getAdminDb } from './firebase-admin';
import type { Purchase, PurchasedCourseInfo } from './types';

const serializeDoc = (doc: FirebaseFirestore.DocumentSnapshot): any => {
    const data = doc.data();
    if (!data) {
        return { id: doc.id };
    }
    const docData: { [key: string]: any } = { id: doc.id, ...data };
    
    for (const key in docData) {
      if (docData[key] && typeof docData[key].toDate === 'function') {
        docData[key] = docData[key].toDate().toISOString();
      }
    }
    return docData;
}


export async function getPurchaseHistory(userId: string): Promise<Purchase[]> {
    if (!userId) {
        console.error("User ID is required to fetch purchase history.");
        return [];
    }

    const adminDb = getAdminDb();

    try {
        // 1. Get all purchased courses for the user to identify all relevant tenant IDs
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return [];
        }

        const userData = userDoc.data();
        if (!userData || !userData.purchasedCourses) {
            return [];
        }

        const purchasedCoursesInfo: Record<string, PurchasedCourseInfo> = userData.purchasedCourses;
        
        // 2. Collect all unique tenant IDs from the user's purchases
        const tenantIds = new Set<string>();
        Object.values(purchasedCoursesInfo).forEach(info => tenantIds.add(info.tenantId));

        const allPurchases: Purchase[] = [];

        // 3. Fetch purchases from each tenant
        for (const tenantId of Array.from(tenantIds)) {
            const purchasesQuery = adminDb.collection(`tenants/${tenantId}/purchases`)
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc');
            
            const querySnapshot = await purchasesQuery.get();

            // 4. Fetch course details for each purchase
            for (const doc of querySnapshot.docs) {
                const purchaseData = serializeDoc(doc) as Purchase;
                
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
        
        // 5. Re-sort all collected purchases by date
        allPurchases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return allPurchases;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
        console.error(`Error fetching purchase history for user ${userId}:`, errorMessage);
        return [];
    }
}
