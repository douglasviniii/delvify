
'use server';

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase'; // Use client SDK for reads
import type { GlobalSettings } from './types';


const defaultSettings: GlobalSettings = {
    logoUrl: "https://picsum.photos/128/32?random=logo",
    primaryColor: "#9466FF",
    footerInfo: {
        email: 'contato@delvind.com',
        phone: '45 8800-0647',
        cnpj: '57.278.676/0001-69',
        cnpjLink: 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=57278676000169',
        copyrightText: `© {YEAR} DelviFy Tecnologia Da Informação LTDA.`,
    },
    socialLinks: {
        instagram: { enabled: true, url: 'https://instagram.com' },
        facebook: { enabled: true, url: 'https://facebook.com' },
        linkedin: { enabled: false, url: '' },
        youtube: { enabled: false, url: '' },
        whatsapp: { enabled: true, url: 'https://wa.me/554588000647' },
    },
    socialsLocation: {
        showInHeader: false,
        showInFooter: true,
    },
    pageVisibility: {
        home: true,
        courses: true,
        blog: true,
        faq: true,
        about: true,
        contact: true,
        'privacy-policy': true,
        'terms-of-use': true,
        'cookie-policy': true,
        'refund-policy': true,
        'support-policy': true,
        'copyright-policy': true,
    },
    colors: {
        navbarLinkColor: "#4B5563", // text-gray-600
        navbarLinkHoverColor: "#9466FF", // primary
        footerLinkColor: "#4B5563", // text-gray-600
        footerLinkHoverColor: "#9466FF", // primary
    }
};


const settingsRef = (tenantId: string) => 
  doc(db, `tenants/${tenantId}/settings/global`);

// Função para buscar as configurações globais de um inquilino
export async function getGlobalSettingsForTenant(tenantId: string): Promise<GlobalSettings> {
  if (!tenantId) {
    console.warn("Tenant ID não fornecido, retornando configurações padrão.");
    return defaultSettings;
  }
  try {
    const docSnap = await getDoc(settingsRef(tenantId));
    if (docSnap.exists()) {
      // Mescla as configurações salvas com as padrão para garantir que todos os campos existam
      const savedData = docSnap.data();
      return {
          ...defaultSettings,
          ...savedData,
          footerInfo: {
              ...defaultSettings.footerInfo,
              ...(savedData?.footerInfo || {})
          },
          socialLinks: {
              ...defaultSettings.socialLinks,
              ...(savedData?.socialLinks || {})
          },
          socialsLocation: {
            ...defaultSettings.socialsLocation,
            ...(savedData?.socialsLocation || {})
          },
          pageVisibility: {
            ...defaultSettings.pageVisibility,
            ...(savedData?.pageVisibility || {})
          },
          colors: {
            ...defaultSettings.colors,
            ...(savedData?.colors || {})
          }
      } as GlobalSettings;
    }
    // Se não houver configurações salvas, retorna o padrão
    return defaultSettings;
  } catch (error: any) {
    // Log the error but return default settings to avoid breaking the UI
    console.error('Erro ao buscar as configurações globais, retornando padrão:', error.message);
    return defaultSettings;
  }
}

export async function getGlobalSettings(tenantId: string): Promise<GlobalSettings | null> {
    if (!tenantId) {
        return null;
    }
    try {
        const docSnap = await getDoc(settingsRef(tenantId));
        if (docSnap.exists()) {
            return docSnap.data() as GlobalSettings;
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar configurações globais (cliente):", error);
        return null;
    }
}
