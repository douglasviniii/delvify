
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { FinancialSettings } from '@/lib/types';
import { FinancialSettingsSchema } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SUPER_ADMIN_UID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

const settingsRef = (tenantId: string) => 
  getAdminDb().collection('tenants').doc(tenantId).collection('settings').doc('financial');

const settingsRefClient = (tenantId: string) =>
  doc(db, `tenants/${tenantId}/settings/financial`);

// Action to save settings
export async function saveFinancialSettings(data: FinancialSettings) {
  const validation = FinancialSettingsSchema.safeParse(data);
  if (!validation.success) {
      console.error("Validation errors:", validation.error.errors);
      return { success: false, message: `Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}` };
  }

  try {
    // Financial settings are global for the platform, stored under the super admin's tenant document.
    await settingsRef(SUPER_ADMIN_UID).set(validation.data, { merge: true });
    
    revalidatePath('/admin/companies');

    return { 
        success: true, 
        message: 'Configurações financeiras salvas com sucesso!', 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error('Erro ao salvar as configurações financeiras:', error);
    return { success: false, message: `Erro ao salvar: ${errorMessage}` };
  }
}

// Function to get settings
export async function getFinancialSettings(): Promise<FinancialSettings | null> {
    try {
        const docSnap = await getDoc(settingsRefClient(SUPER_ADMIN_UID));
        if (docSnap.exists()) {
            return docSnap.data() as FinancialSettings;
        }
        return null;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
        console.error('Erro ao buscar as configurações financeiras:', errorMessage);
        throw new Error('Não foi possível buscar as configurações financeiras.');
    }
}
