
import type {Metadata} from 'next';
import { getGlobalSettingsForTenant } from '@/lib/settings';

// Function to convert hex color to HSL format for CSS variables
function hexToHsl(hex: string): string {
    if (!hex || typeof hex !== 'string') {
        hex = '#9466FF'; // Default color if input is invalid
    }
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    const hValue = Math.round(h * 360);
    const sValue = Math.round(s * 100);
    const lValue = Math.round(l * 100);

    return `${hValue} ${sValue}% ${lValue}%`;
}


export async function generateMetadata({ params }: { params: { tenantId: string } }): Promise<Metadata> {
  const settings = await getGlobalSettingsForTenant(params.tenantId);
  return {
    title: settings.footerInfo.copyrightText || 'DelviFy',
    description: 'A plataforma completa para criação de cursos e gerenciamento de inquilinos',
  };
}


export default async function TenantLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { tenantId: string };
}>) {
  
  const settings = await getGlobalSettingsForTenant(params.tenantId);
  const primaryColorHsl = hexToHsl(settings.primaryColor);

  return (
    <>
      <style
        id="custom-theme-variables"
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColorHsl};
            }
          `,
        }}
      />
      {children}
    </>
  );
}
