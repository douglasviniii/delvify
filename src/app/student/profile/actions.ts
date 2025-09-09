
'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';

const profileSchema = z.object({
  name: z.string().min(3, 'O nome completo é obrigatório.'),
  socialName: z.string().min(2, 'O nome social é obrigatório.'),
  cpf: z.string(),
  birthDate: z.string(),
  address: z.string().min(5, 'O endereço é obrigatório.'),
  neighborhood: z.string().min(2, 'O bairro é obrigatório.'),
  city: z.string().min(2, 'A cidade é obrigatória.'),
  state: z.string().min(2, 'O estado é obrigatório.'),
  cep: z.string().min(8, 'O CEP é obrigatório.'),
});

export async function updateStudentProfile(uid: string, data: any) {
    if (!uid) {
        return { success: false, message: 'Usuário não autenticado.'};
    }

    const validatedFields = profileSchema.safeParse({
        name: data.name,
        socialName: data.socialName,
        cpf: data.cpf,
        birthDate: data.birthDate,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        cep: data.cep,
    });
    
    if (!validatedFields.success) {
        return { 
            success: false, 
            message: validatedFields.error.errors.map(e => e.message).join(', ') 
        };
    }
    
    const { socialName, ...firestoreData } = validatedFields.data;

    try {
        // Update Firestore document
        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update({
            ...firestoreData,
            socialName, // Make sure socialName is also saved in Firestore
        });

        // Update Firebase Auth profile
        await getAuth().updateUser(uid, {
            displayName: socialName,
        });

        revalidatePath('/student/profile');
        revalidatePath('/student/layout'); // Revalidate layout to update display name

        return { success: true, message: 'Perfil atualizado com sucesso!' };

    } catch (error) {
        console.error("Error updating student profile:", error);
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        return { success: false, message: `Falha ao atualizar perfil: ${errorMessage}`};
    }
}
