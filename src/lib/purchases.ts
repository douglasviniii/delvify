'use server';

import { adminDb } from './firebase-admin';

export type Purchase = {
    id: string;
    userId: string;
    courseId: string;
    courseTitle?: string; // Will be added by combining data
    amount: number;
    currency?: string;
    stripeCheckoutSessionId?: string;
    createdAt: string;
};

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


export async function getPurchaseHistory(tenantId: string, userId: string): Promise<Purchase[]> {
    if (!tenantId || !userId) {
        console.error("Tenant ID and User ID are required to fetch purchase history.");
        return [];
    }

    try {
        const purchases: Purchase[] = [];
        const purchasesQuery = adminDb.collection(`tenants/${tenantId}/purchases`)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc');
        
        const querySnapshot = await purchasesQuery.get();

        // Use Promise.all to fetch course details in parallel
        await Promise.all(querySnapshot.docs.map(async (doc) => {
            const purchaseData = serializeDoc(doc) as Purchase;
            
            // Fetch course details to get the title
            try {
                const courseRef = await adminDb.doc(`tenants/${tenantId}/courses/${purchaseData.courseId}`).get();
                if(courseRef.exists) {
                    purchaseData.courseTitle = courseRef.data()?.title || 'Curso não encontrado';
                } else {
                    purchaseData.courseTitle = 'Curso não encontrado';
                }
            } catch (courseError) {
                console.error(`Could not fetch course title for courseId ${purchaseData.courseId}`, courseError);
                purchaseData.courseTitle = 'Detalhes do curso indisponíveis';
            }

            purchases.push(purchaseData);
        }));

        // Re-sort because parallel execution can mess up the order
        purchases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return purchases;

    } catch (error) {
        console.error(`Error fetching purchase history for tenant ${tenantId} and user ${userId}:`, error);
        return [];
    }
}
