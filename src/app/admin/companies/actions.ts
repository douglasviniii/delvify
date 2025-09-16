
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';


export async function saveTenantDomain(tenantId: string, domain: string) {
    if (!tenantId) {
        return { success: false, message: "ID do inquilino não encontrado." };
    }
    
    // Zod schema to validate domain name
    const DomainSchema = z.string().regex(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/, "Formato de domínio inválido").or(z.literal(''));
    
    const validation = DomainSchema.safeParse(domain);

    if (!validation.success) {
        return { success: false, message: `Domínio inválido: ${validation.error.errors.map(e => e.message).join(', ')}` };
    }

    try {
        const tenantRef = getAdminDb().collection('tenants').doc(tenantId);
        await tenantRef.update({
            customDomain: validation.data || null, // Salva null se o campo estiver vazio
        });

        // Revalidate the pages that might be affected by this change
        revalidatePath(`/`);
        revalidatePath(`/admin/companies`);

        return { success: true, message: 'Domínio salvo com sucesso!' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error("Erro ao salvar domínio:", error);
        return { success: false, message: `Erro ao salvar: ${errorMessage}` };
    }
}
