'use server';

/**
 * @fileOverview A flow that allows tenant admins to customize the branding of their tenant using natural language.
 *
 * - customizeTenantBranding - A function that handles the tenant branding customization process.
 * - CustomizeTenantBrandingInput - The input type for the customizeTenantBranding function.
 * - CustomizeTenantBrandingOutput - The return type for the customizeTenantBranding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeTenantBrandingInputSchema = z.object({
  tenantId: z.string().describe('The ID of the tenant to customize.'),
  brandingInstructions: z.string().describe('Natural language instructions for customizing the tenant branding (colors, logos, fonts).'),
});
export type CustomizeTenantBrandingInput = z.infer<typeof CustomizeTenantBrandingInputSchema>;

const CustomizeTenantBrandingOutputSchema = z.object({
  suggestedThemeSettings: z.string().describe('A JSON string containing the suggested theme settings based on the instructions.'),
  explanation: z.string().describe('An explanation of how the theme settings were derived from the instructions.'),
});
export type CustomizeTenantBrandingOutput = z.infer<typeof CustomizeTenantBrandingOutputSchema>;

export async function customizeTenantBranding(input: CustomizeTenantBrandingInput): Promise<CustomizeTenantBrandingOutput> {
  return customizeTenantBrandingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customizeTenantBrandingPrompt',
  input: {schema: CustomizeTenantBrandingInputSchema},
  output: {schema: CustomizeTenantBrandingOutputSchema},
  prompt: `You are an expert in branding and theming for web applications. You will receive instructions from a tenant admin on how they want to customize the branding of their tenant.

  Based on these instructions, you will generate a JSON object containing the suggested theme settings. The JSON object should include settings for colors, logos, and fonts.

  Instructions: {{{brandingInstructions}}}

  Tenant ID: {{{tenantId}}}
  
  Example JSON structure:
  {
    "colors": {
      "primary": "#9466FF",
      "secondary": "#F0F4F9",
      "accent": "#FFFFFF"
    },
    "logos": {
      "url": "/path/to/logo.png",
      "altText": "Tenant Logo"
    },
    "fonts": {
      "headlineFont": "Space Grotesk",
      "bodyFont": "Inter"
    }
  }

  In addition to the JSON object, you will provide a brief explanation of how you derived the theme settings from the instructions.
`,
});

const customizeTenantBrandingFlow = ai.defineFlow(
  {
    name: 'customizeTenantBrandingFlow',
    inputSchema: CustomizeTenantBrandingInputSchema,
    outputSchema: CustomizeTenantBrandingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
