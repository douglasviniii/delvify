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
  prompt: `Você é um especialista em branding e temas para aplicações web. Você receberá instruções de um administrador de inquilino sobre como eles desejam personalizar o branding de seu inquilino.

  Com base nessas instruções, você gerará um objeto JSON contendo as configurações de tema sugeridas. O objeto JSON deve incluir configurações para cores, logotipos e fontes.

  Instruções: {{{brandingInstructions}}}

  ID do Inquilino: {{{tenantId}}}
  
  Exemplo de estrutura JSON:
  {
    "colors": {
      "primary": "#9466FF",
      "secondary": "#F0F4F9",
      "accent": "#FFFFFF"
    },
    "logos": {
      "url": "/path/to/logo.png",
      "altText": "Logo do Inquilino"
    },
    "fonts": {
      "headlineFont": "Space Grotesk",
      "bodyFont": "Inter"
    }
  }

  Além do objeto JSON, você fornecerá uma breve explicação de como derivou as configurações do tema a partir das instruções.
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
