
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'DelviFy',
  description: 'A plataforma completa para criação de cursos e gerenciamento de inquilinos',
};

function hexToHsl(hex: string): string {
    if (!hex || typeof hex !== 'string') {
        hex = '#9466FF'; // Default color
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

// Este é o ID do inquilino principal. Usaremos isso por enquanto para estabilizar o app.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);
  const primaryColorHsl = hexToHsl(settings.primaryColor);

  return (
    <html lang="pt-br">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
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
        </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
