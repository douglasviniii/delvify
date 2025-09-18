
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { collection, getDocs, query, orderBy, where, Timestamp, writeBatch, collectionGroup, doc as clientDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tenant } from './page';
import { getFinancialSettings } from './financial-settings-actions';
import type { Purchase, Invoice } from '@/lib/types';


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
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Serialize the Timestamp to a string to make it a "plain object"
            const serializedData = {
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
            };
            return { id: doc.id, ...serializedData } as Tenant;
        });
    } catch (error) {
        console.error("Error fetching tenants:", error);
        return [];
    }
}


export async function generateMonthlyInvoices(year: number, month: number) {
    console.log(`Iniciando geração de faturas para ${month}/${year}`);
    const batch = writeBatch(db);

    try {
        const financialSettings = await getFinancialSettings();
        if (!financialSettings) {
            return { success: false, message: "Configurações financeiras não encontradas. Configure as taxas primeiro." };
        }

        const tenants = await getTenants();
        if (tenants.length === 0) {
            return { success: true, message: "Nenhuma empresa (inquilino) encontrada para gerar faturas." };
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        for (const tenant of tenants) {
            const purchasesQuery = query(
                collection(db, `tenants/${tenant.id}/purchases`),
                where('createdAt', '>=', startDate),
                where('createdAt', '<=', endDate)
            );
            
            const purchasesSnapshot = await getDocs(purchasesQuery);
            if (purchasesSnapshot.empty) {
                console.log(`Nenhuma venda para ${tenant.companyName} no período.`);
                continue;
            }

            let totalRevenue = 0;
            let totalStripeFees = 0;
            let totalTaxes = 0;
            let totalDelvifyFees = 0;

            purchasesSnapshot.docs.forEach(doc => {
                const purchase = doc.data() as Purchase;
                const saleValue = purchase.amount;
                totalRevenue += saleValue;

                const taxValue = saleValue * (financialSettings.taxPercentage / 100);
                totalTaxes += taxValue;

                const valueAfterTaxes = saleValue - taxValue;
                
                let stripeFee = 0;
                if (purchase.paymentMethod === 'card') {
                    stripeFee = valueAfterTaxes * (financialSettings.stripeCardPercentage / 100) + financialSettings.stripeCardFixed;
                } else if (purchase.paymentMethod === 'boleto') {
                    stripeFee = financialSettings.stripeBoletoFixed;
                } else if (purchase.paymentMethod === 'pix') {
                    stripeFee = valueAfterTaxes * (financialSettings.stripePixPercentage / 100);
                }
                totalStripeFees += stripeFee;

                const valueAfterStripe = valueAfterTaxes - stripeFee;
                
                const delvifyFee = valueAfterStripe * (financialSettings.delvifyPercentage / 100) + financialSettings.delvifyFixed;
                totalDelvifyFees += delvifyFee;
            });

            const netAmountToTransfer = totalRevenue - totalStripeFees - totalTaxes - totalDelvifyFees;

            const invoiceId = `${year}-${String(month).padStart(2, '0')}`;
            const invoiceRef = clientDoc(db, `tenants/${tenant.id}/invoices`, invoiceId);

            batch.set(invoiceRef, {
                tenantId: tenant.id,
                month,
                year,
                totalRevenue,
                totalTaxes,
                totalStripeFees,
                totalDelvifyFees,
                netAmountToTransfer,
                status: 'pending',
                generatedAt: Timestamp.now(),
                purchaseIds: purchasesSnapshot.docs.map(d => d.id),
            });
             console.log(`Fatura ${invoiceId} preparada para ${tenant.companyName}. Valor a transferir: ${netAmountToTransfer}`);
        }

        await batch.commit();
        revalidatePath('/admin/companies');
        return { success: true, message: `Faturas para ${month}/${year} geradas com sucesso!` };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error("Erro ao gerar faturas mensais:", errorMessage);
        return { success: false, message: `Erro ao gerar faturas: ${errorMessage}` };
    }
}

export async function getGeneratedInvoices(year: number, month: number): Promise<Invoice[]> {
  try {
    const invoicesQuery = query(
      collectionGroup(db, 'invoices'),
      where('year', '==', year),
      where('month', '==', month)
    );
    
    const querySnapshot = await getDocs(invoicesQuery);
    const invoices: Invoice[] = [];
    
    querySnapshot.forEach(doc => {
        const data = doc.data();
         const serializedData = {
            ...data,
            id: doc.id,
            generatedAt: data.generatedAt?.toDate ? data.generatedAt.toDate().toISOString() : data.generatedAt,
        };
      invoices.push(serializedData as Invoice);
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching generated invoices:", error);
    return [];
  }
}

export async function setTenantStatus(tenantId: string, status: 'active' | 'inactive') {
    if (!tenantId) {
        return { success: false, message: "ID do inquilino não encontrado." };
    }

    try {
        const tenantRef = clientDoc(db, 'tenants', tenantId);
        await updateDoc(tenantRef, { status });

        revalidatePath('/admin/companies');
        return { success: true, message: `Empresa ${status === 'active' ? 'ativada' : 'desativada'} com sucesso.` };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        console.error("Erro ao alterar status da empresa:", error);
        return { success: false, message: `Erro ao alterar status: ${errorMessage}` };
    }
}
