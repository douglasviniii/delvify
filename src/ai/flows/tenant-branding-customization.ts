
'use server';

/**
 * @fileOverview A flow that allows tenant admins to customize the branding of their tenant using natural language.
 *
 * - customizeTenantBranding - A function that handles the tenant branding customization process.
 */

import {ai} from '@/ai/genkit';
import { CustomizeTenantBrandingInputSchema, CustomizeTenantBrandingOutputSchema } from '@/lib/types';
import type { CustomizeTenantBrandingInput, CustomizeTenantBrandingOutput } from '@/lib/types';


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
