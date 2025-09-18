
'use server';

import { z } from 'zod';
import { getAdminDb, getAdminStorage, getAdminAuth } from '@/lib/firebase-admin';
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
  photoURL: z.string().nullable(),
});

export async function updateStudentProfile(uid: string, data: any) {
    if (!uid) {
        return { success: false, message: 'Usuário não autenticado.'};
    }

    const validatedFields = profileSchema.safeParse(data);
    
    if (!validatedFields.success) {
        return { 
            success: false, 
            message: validatedFields.error.errors.map(e => e.message).join(', ') 
        };
    }
    
    const { photoURL, ...firestoreData } = validatedFields.data;
    const { socialName } = validatedFields.data;

    try {
        let finalPhotoURL = photoURL;
        const adminStorage = getAdminStorage();

        if (photoURL && photoURL.startsWith('data:image')) {
            const mimeType = photoURL.split(';')[0].split(':')[1];
            const base64Data = photoURL.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
            const bucket = adminStorage.bucket();
            const fileName = `users/${uid}/profile_image.${mimeType.split('/')[1]}`;
            const file = bucket.file(fileName);

            await file.save(imageBuffer, {
                metadata: { contentType: mimeType },
                public: true, 
            });
            
            finalPhotoURL = file.publicUrl();
        }

        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();

        // Update Firestore document
        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update({
            ...firestoreData,
            photoURL: finalPhotoURL,
        });

        // Update Firebase Auth profile
        await adminAuth.updateUser(uid, {
            displayName: socialName,
            photoURL: finalPhotoURL,
        });

        revalidatePath('/student/profile', 'page');
        revalidatePath('/student', 'layout');

        return { success: true, message: 'Perfil atualizado com sucesso!', newPhotoURL: finalPhotoURL };

    } catch (error) {
        console.error("Error updating student profile:", error);
        const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
        return { success: false, message: `Falha ao atualizar perfil: ${errorMessage}`};
    }
}
