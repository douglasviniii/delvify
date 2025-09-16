
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { headers } from 'next/headers';

// Removido getGlobalSettingsForTenant e a lógica de cor primária daqui
// pois o layout raiz não deve ser dinâmico para i18n funcionar corretamente.
// Essa lógica será movida para o layout aninhado em [lang]/layout.tsx

export const metadata: Metadata = {
  title: 'DelviFy',
  description: 'A plataforma completa para criação de cursos e gerenciamento de inquilinos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    // O `lang` será definido no layout aninhado
    <html>
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
