"use server";

import { z } from "zod";
import { customizeTenantBranding, type CustomizeTenantBrandingOutput } from "@/ai/flows/tenant-branding-customization";

const brandingSchema = z.object({
  instructions: z.string().min(10, "Please provide more detailed instructions."),
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
      message: "Invalid form data.",
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
        message: "An error occurred while processing your request.",
        fields: validatedFields.data,
    }
  }
}
