
'use server';

import { z } from 'zod';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

const signupSchema = z.object({
  companyName: z.string().min(3, 'O nome da empresa é obrigatório.'),
  cnpj: z.string().min(14, 'O CNPJ é obrigatório e deve ser válido.'),
  adminName: z.string().min(3, 'O nome do administrador é obrigatório.'),
  email: z.string().email('O e-mail fornecido é inválido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});


export async function signupTenant(
    prevState: { success: boolean; message: string; },
    formData: FormData
): Promise<{ success: boolean; message: string; issues?: string[] }> {
    const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Dados inválidos. Verifique os campos.",
            issues: validatedFields.error.flatten().fieldErrors,
        } as any;
    }

    const { email, password, adminName, companyName, cnpj } = validatedFields.data;
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    try {
        // 1. Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: adminName,
        });

        // 2. Create tenant document in Firestore
        const tenantRef = adminDb.collection('tenants').doc(userRecord.uid);
        
        await tenantRef.set({
            companyName,
            cnpj,
            adminId: userRecord.uid,
            status: 'active',
            plan: 'Padrão',
            createdAt: FieldValue.serverTimestamp(),
        });
        
        // You might want to create a default profile for the tenant admin as well
        // For example, in a 'users' collection or a subcollection in the tenant
        const tenantAdminProfileRef = adminDb.collection('users').doc(userRecord.uid);
        await tenantAdminProfileRef.set({
            name: adminName,
            email: email,
            role: 'tenant-admin', // Custom claim could be better
            tenantId: userRecord.uid,
            createdAt: FieldValue.serverTimestamp(),
        });


        // Revalidate the path to show the new company on the admin page
        revalidatePath('/admin/companies');

        return { success: true, message: "Empresa e administrador criados com sucesso! Você já pode fazer o login." };

    } catch (error: any) {
        console.error("Error creating tenant:", error);
        let message = 'Ocorreu um erro ao criar a conta.';
        if (error.code === 'auth/email-already-exists') {
            message = 'Este e-mail já está em uso por outro administrador.';
        }
        return { success: false, message };
    }
}
