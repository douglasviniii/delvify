
'use server';

import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, getDocs, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';

interface Module {
  id?: string;
  title: string;
  description?: string;
  contentUrl: string;
  order: number;
}

export async function saveCourseModules(tenantId: string, courseId: string, modules: Module[]) {
    if (!tenantId || !courseId) {
        throw new Error("Tenant ID e Course ID são obrigatórios.");
    }
    
    const batch = writeBatch(db);
    const modulesCollectionRef = collection(db, `tenants/${tenantId}/courses/${courseId}/modules`);

    // Obter os módulos existentes para comparar
    const existingModulesSnap = await getDocs(modulesCollectionRef);
    const existingModulesMap = new Map(existingModulesSnap.docs.map(doc => [doc.id, doc.data()]));
    const incomingModuleIds = new Set(modules.map(m => m.id).filter(Boolean));

    // Excluir módulos que não estão mais na lista
    for (const [id] of existingModulesMap) {
        if (!incomingModuleIds.has(id)) {
            batch.delete(doc(modulesCollectionRef, id));
        }
    }

    // Adicionar novos ou atualizar existentes
    modules.forEach((module, index) => {
        const data = { 
            title: module.title,
            description: module.description || '',
            contentUrl: module.contentUrl,
            order: index 
        };
        if (module.id && existingModulesMap.has(module.id)) {
            // Módulo existente, atualiza
            const moduleRef = doc(modulesCollectionRef, module.id);
            batch.update(moduleRef, data);
        } else {
            // Novo módulo, adiciona
            // A ID será gerada automaticamente pelo Firestore
            const moduleRef = doc(collection(modulesCollectionRef));
            batch.set(moduleRef, data);
        }
    });

    await batch.commit();

    return { success: true, message: "Episódios salvos com sucesso." };
}

    