
'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Printer, Download } from 'lucide-react';
import type { CertificateSettings } from '@/lib/certificates';
import type { Module } from '@/lib/courses';
import { Separator } from './ui/separator';

interface CertificateProps {
    studentName: string;
    courseName: string;
    completionDate: Date;
    courseModules: Module[];
    settings: CertificateSettings | null;
}

const defaultSettings: CertificateSettings = {
    companyName: 'Sua Instituição Aqui',
    companyAddress: 'Seu Endereço Completo, 123',
    companyPhone: '(00) 0000-0000',
    companyEmail: 'contato@suainstituicao.com',
    companyWebsite: 'www.suainstituicao.com',
    companyCnpj: '00.000.000/0001-00',
    additionalInfo: 'Certificado válido em todo território nacional.',
    mainLogoUrl: 'https://picsum.photos/seed/logo/200/80',
    watermarkLogoUrl: 'https://picsum.photos/seed/watermark/400/400',
    signatureUrl: 'https://picsum.photos/seed/signature/200/100',
    accentColor: '#000000',
    signatureText: 'Responsável pela Instituição',
};


const Certificate: React.FC<CertificateProps> = ({ studentName, courseName, completionDate, courseModules, settings }) => {
    const effectiveSettings = settings || defaultSettings;
    const {
        mainLogoUrl,
        watermarkLogoUrl,
        companyName,
        accentColor,
        signatureUrl,
        signatureText,
        additionalInfo,
        companyAddress,
        companyCnpj,
    } = effectiveSettings;

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="w-full max-w-5xl flex justify-end gap-2 mb-4 print:hidden">
                 <Button onClick={handlePrint} variant="outline"><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
            </div>
            
            <div className="w-full max-w-5xl aspect-[297/210] bg-white shadow-lg p-0 flex flex-col page-break-container">
                {/* Front of Certificate */}
                <div className="certificate-page relative w-full h-full flex-shrink-0 p-10 border-4" style={{ borderColor: accentColor }}>
                    {watermarkLogoUrl && (
                        <Image
                            src={watermarkLogoUrl}
                            alt="Marca d'água"
                            layout="fill"
                            objectFit="contain"
                            className="absolute inset-0 m-auto opacity-10 z-0"
                            data-ai-hint="logo watermark"
                        />
                    )}
                    <div className="relative z-10 flex flex-col h-full">
                        <header className="flex justify-between items-center pb-4 border-b-2" style={{ borderColor: accentColor }}>
                            {mainLogoUrl ? (
                                <Image src={mainLogoUrl} alt="Logo da Empresa" width={150} height={60} objectFit="contain" data-ai-hint="company logo"/>
                            ) : <span>{companyName}</span>}
                             <div className="text-right text-xs text-gray-600">
                                <p className="font-bold">{companyName}</p>
                                <p>{companyAddress}</p>
                                <p>CNPJ: {companyCnpj}</p>
                            </div>
                        </header>

                        <main className="flex-1 flex flex-col items-center justify-center text-center">
                            <h1 className="text-5xl font-bold font-headline" style={{ color: accentColor }}>Certificado de Conclusão</h1>
                            <p className="mt-8 text-xl">Certificamos que</p>
                            <p className="mt-2 text-4xl font-semibold font-serif tracking-wider">{studentName}</p>
                            <p className="mt-6 text-xl max-w-3xl">
                                concluiu com sucesso o curso de <strong style={{ color: accentColor }}>{courseName}</strong>,
                                em {completionDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
                            </p>
                        </main>

                        <footer className="flex justify-center items-end gap-16">
                            <div className="text-center">
                               {signatureUrl && <Image src={signatureUrl} alt="Assinatura" width={180} height={90} objectFit="contain" data-ai-hint="signature" />}
                                <hr className="border-gray-700 mt-1" />
                                <p className="text-sm font-semibold mt-1">{signatureText}</p>
                            </div>
                        </footer>
                    </div>
                </div>

                {/* Back of Certificate */}
                <div className="certificate-page relative w-full h-full flex-shrink-0 p-10 border-4 mt-8" style={{ borderColor: accentColor }}>
                     {watermarkLogoUrl && (
                        <Image
                            src={watermarkLogoUrl}
                            alt="Marca d'água"
                            layout="fill"
                            objectFit="contain"
                            className="absolute inset-0 m-auto opacity-10 z-0"
                            data-ai-hint="logo watermark"
                        />
                    )}
                     <div className="relative z-10 flex flex-col h-full">
                        <header className="text-center pb-4">
                            <h2 className="text-3xl font-bold font-headline" style={{ color: accentColor }}>Conteúdo Programático</h2>
                            <p className="text-lg font-semibold">{courseName}</p>
                        </header>

                        <main className="flex-1 mt-6">
                            <ul className="space-y-2 columns-2">
                                {courseModules.map((module) => (
                                    <li key={module.id} className="text-sm text-gray-700 break-inside-avoid">{module.order + 1}. {module.title}</li>
                                ))}
                            </ul>
                        </main>
                        
                        <footer className="text-center text-xs text-gray-600 space-y-2 pt-4 border-t">
                            <p>{additionalInfo}</p>
                            <p>Para verificar a autenticidade deste certificado, acesse nosso site.</p>
                        </footer>
                     </div>
                </div>
            </div>
             <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page-break-container {
                        display: block;
                    }
                    .certificate-page {
                        page-break-after: always;
                        width: 100%;
                        height: 100vh;
                        border-width: 8px !important;
                    }
                     .certificate-page:last-child {
                        page-break-after: avoid;
                    }
                }
                @page {
                    size: A4 landscape;
                    margin: 0;
                }
            `}</style>
        </>
    );
};

export default Certificate;

