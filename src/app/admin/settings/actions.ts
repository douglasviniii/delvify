"use server";

import { z } from "zod";
import { customizeTenantBranding, type CustomizeTenantBrandingOutput } from "@/ai/flows/tenant-branding-customization";

const brandingSchema = z.object({
  instructions: z.string().min(10, "Forneça instruções mais detalhadas."),
});

type BrandingState = {
  message?: string;
  fields?: { instructions: string };
  issues?: string[];
  data?: CustomizeTenantBrandingOutput;
}

export async function submitBrandingRequest(
  prevState: BrandingState,
  formData: FormData
): Promise<BrandingState> {
  const validatedFields = brandingSchema.safeParse({
    instructions: formData.get("instructions"),
  });

  if (!validatedFields.success) {
    return {
      message: "Dados do formulário inválidos.",
      fields: {
        instructions: formData.get("instructions") as string,
      },
      issues: validatedFields.error.issues.map((issue) => issue.message),
    };
  }

  try {
    const result = await customizeTenantBranding({
        tenantId: 'current_tenant', // In a real app, this would come from session/auth
        brandingInstructions: validatedFields.data.instructions,
    });
    return { message: "success", data: result };
  } catch (error) {
    console.error(error);
    return {
        message: "Ocorreu um erro ao processar sua solicitação.",
        fields: validatedFields.data,
    }
  }
}
