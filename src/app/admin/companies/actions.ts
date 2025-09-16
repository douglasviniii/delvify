
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tenant } from './page';


export async function saveTenantDomain(tenantId: string, domain: string) {
    if (!tenantId) {
        return { success: false, message: "ID do inquilino não encontrado." };
    }
    
    const DomainSchema = z.string().regex(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/, "Formato de domínio inválido").or(z.literal(''));
    
    const validation = DomainSchema.safeParse(domain);

    if (!validation.success) {
        return { success: false, message: `Domínio inválido: ${validation.error.errors.map(e => e.message).join(', ')}` };
    }

    try {
        const tenantRef = getAdminDb().collection('tenants').doc(tenantId);
        await tenantRef.update({
            customDomain: validation.data || null,
        });

        revalidatePath(`/`);
        revalidatePath(`/admin/companies`);

        return { success: true, message: 'Domínio salvo com sucesso!' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error("Erro ao salvar domínio:", error);
        return { success: false, message: `Erro ao salvar: ${errorMessage}` };
    }
}

export async function saveTenantNotes(tenantId: string, notes: string) {
     if (!tenantId) {
        return { success: false, message: "ID do inquilino não encontrado." };
    }

    try {
        const tenantRef = getAdminDb().collection('tenants').doc(tenantId);
        await tenantRef.update({
            notes: notes || '',
        });

        revalidatePath(`/admin/companies`);

        return { success: true, message: 'Anotações salvas com sucesso!' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error("Erro ao salvar anotações:", error);
        return { success: false, message: `Erro ao salvar: ${errorMessage}` };
    }
}

export async function getTenants(): Promise<Tenant[]> {
    try {
        const tenantsQuery = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(tenantsQuery);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
    } catch (error) {
        console.error("Error fetching tenants:", error);
        return [];
    }
}
