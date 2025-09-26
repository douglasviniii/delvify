
'use server';

import { getAdminDb, serializeDoc } from '@/lib/firebase-admin';
import { getInitialPageData } from '@/lib/initial-page-data';

export async function getPageSections(tenantId: string, pageId: string) {
    try {
        const adminDb = getAdminDb();
        const pageRef = adminDb.collection(`tenants/${tenantId}/pages`).doc(pageId);
        const pageSnap = await pageRef.get();
        const initialData = getInitialPageData();
        const defaultPageData = initialData[pageId as keyof typeof initialData] || { sections: [] };

        if (pageSnap.exists) {
            const pageData = serializeDoc(pageSnap);
             if (pageData && Array.isArray(pageData.sections)) {
                return pageData.sections;
            }
        }
        
        console.warn(`No page data found for ${tenantId}/${pageId}, returning initial data.`);
        return defaultPageData.sections || [];
    } catch (error) {
        console.error(`Error fetching page sections for ${pageId}, returning initial data:`, error);
        const initialData = getInitialPageData();
        const defaultPageData = initialData[pageId as keyof typeof initialData] || { sections: [] };
        return defaultPageData.sections || [];
    }
}
