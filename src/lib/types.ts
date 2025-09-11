
import { z } from 'zod';

export interface CertificateSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyCnpj: string;
  additionalInfo?: string;
  mainLogoUrl: string | null;
  watermarkLogoUrl: string | null;
  signatureUrl: string | null;
  accentColor: string;
  signatureText: string;
}

export type Course = {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  price: string;
  promotionalPrice?: string;
  category: string;
  tag?: string;
  coverImageUrl: string;
  contentType: 'video' | 'pdf';
  durationHours: number;
  status: 'draft' | 'published';
  createdAt: string; 
  updatedAt?: string;
};

export type Module = {
    id: string;
    title: string;
    description?: string;
    contentUrl: string;
    order: number;
}

export type Category = {
    id: string;
    name: string;
}

export type Review = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  authorId: string;
  createdAt: string; // Serialized as ISO string
  updatedAt?: string; // Serialized as ISO string
  commentCount?: number; 
  likeCount?: number;
  isLikedByUser?: boolean;
};

export type Comment = {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string;
    text: string;
    createdAt: string;
    likes: number;
}

export interface GlobalSettings {
  logoUrl: string | null;
  primaryColor: string;
  footerInfo: {
    email: string;
    phone: string;
    cnpj: string;
    cnpjLink: string;
    copyrightText: string;
  };
  socialLinks: {
    instagram: { enabled: boolean; url: string };
    facebook: { enabled: boolean; url: string };
    linkedin: { enabled: boolean; url: string };
    youtube: { enabled: boolean; url: string };
    whatsapp: { enabled: boolean; url: string };
  };
  socialsLocation: {
    showInHeader: boolean;
    showInFooter: boolean;
  };
  pageVisibility: {
    [key: string]: boolean;
  };
  colors: {
    navbarLinkColor: string;
    navbarLinkHoverColor: string;
    footerLinkColor: string;
    footerLinkHoverColor: string;
  }
}

export type Purchase = {
    id: string;
    userId: string;
    courseId: string;
    courseTitle?: string; // Will be added by combining data
    amount: number;
    currency?: string;
    stripeCheckoutSessionId?: string;
    createdAt: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  socialName: string;
  email: string;
  cpf: string;
  birthDate: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  photoURL: string | null;
}


export const CustomizeTenantBrandingInputSchema = z.object({
  tenantId: z.string().describe('The ID of the tenant to customize.'),
  brandingInstructions: z.string().describe('Natural language instructions for customizing the tenant branding (colors, logos, fonts).'),
});
export type CustomizeTenantBrandingInput = z.infer<typeof CustomizeTenantBrandingInputSchema>;

export const CustomizeTenantBrandingOutputSchema = z.object({
  suggestedThemeSettings: z.string().describe('A JSON string containing the suggested theme settings based on the instructions.'),
  explanation: z.string().describe('An explanation of how the theme settings were derived from the instructions.'),
});
export type CustomizeTenantBrandingOutput = z.infer<typeof CustomizeTenantBrandingOutputSchema>;
