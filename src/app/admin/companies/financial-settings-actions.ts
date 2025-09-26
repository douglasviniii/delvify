
'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FinancialSettingsSchema, type FinancialSettings } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { serializeDoc } from '@/lib/firebase';

const settingsRefAdmin = () => getAdminDb().collection('settings').doc('financial');
const settingsRefClient = () => doc(db, 'settings', 'financial');

export async function saveFinancialSettings(data: FinancialSettings) {
  const validation = FinancialSettingsSchema.safeParse(data);
  if (!validation.success) {
    return { 
        success: false, 
        message: `Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}` 
    };
  }

  try {
    await settingsRefAdmin().set(validation.data, { merge: true });
    revalidatePath('/admin/companies');
    return { success: true, message: 'Configurações financeiras salvas com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu.';
    console.error('Erro ao salvar as configurações financeiras:', error);
    return { success: false, message: `Erro ao salvar: ${errorMessage}` };
  }
}

export async function getFinancialSettings(): Promise<FinancialSettings | null> {
  try {
    const docSnap = await getDoc(settingsRefClient());
    if (docSnap.exists()) {
      return serializeDoc(docSnap) as FinancialSettings;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar as configurações financeiras:', error);
    return null;
  }
}
