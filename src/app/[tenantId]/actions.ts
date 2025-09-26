
'use server';

import { doc, getDoc } from 'firebase/firestore';
import { db, serializeDoc } from '@/lib/firebase';
import { getInitialPageData } from '@/lib/initial-page-data';

export async function getPageSections(tenantId: string, pageId: string) {
    try {
        const pageRef = doc(db, `tenants/${tenantId}/pages`, pageId);
        const pageSnap = await getDoc(pageRef);
        const initialData = getInitialPageData();
        const defaultPageData = initialData[pageId as keyof typeof initialData] || { sections: [] };

        if (pageSnap.exists()) {
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
