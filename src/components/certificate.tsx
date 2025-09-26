'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Printer, Award, Loader2, Download } from 'lucide-react';
import type { CertificateSettings, Module } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface CertificateProps {
    studentName: string;
    studentCpf: string;
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


const Certificate: React.FC<CertificateProps> = ({ studentName, studentCpf, courseName, completionDate, courseModules, settings }) => {
    const [isDownloading, setIsDownloading] = useState(false);
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
        companyWebsite
    } = effectiveSettings;

    const handleDownloadPdf = async () => {
        setIsDownloading(true);

        const frontPage = document.getElementById('certificate-front');
        const backPage = document.getElementById('certificate-back');

        if (!frontPage || !backPage) {
            console.error("Elementos do certificado não encontrados.");
            setIsDownloading(false);
            return;
        }
        
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        const processPage = async (element: HTMLElement) => {
            const canvas = await html2canvas(element, {
                scale: 2, 
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });
            return canvas.toDataURL('image/png', 1.0);
        };

        try {
            const frontImage = await processPage(frontPage);
            pdf.addImage(frontImage, 'PNG', 0, 0, 297, 210);

            const backImage = await processPage(backPage);
            pdf.addPage();
            pdf.addImage(backImage, 'PNG', 0, 0, 297, 210);

            pdf.save(`Certificado-${courseName.replace(/ /g, '_')}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar o PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };
    
    const verificationCode = `DELV-${completionDate.getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    const verificationUrl = companyWebsite ? `${new URL(companyWebsite).origin}/verify?code=${verificationCode}` : `https://verify.com/verify?code=${verificationCode}`;
    const formattedCompletionDate = completionDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-0">
            <div className="flex justify-end gap-2 mb-4">
                <Button onClick={handleDownloadPdf} variant="outline" disabled={isDownloading} className="bg-white">
                    {isDownloading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Baixando PDF...
                        </>
                    ) : (
                        <>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir ou Salvar como PDF
                        </>
                    )}
                </Button>
            </div>

            <div className="relative w-full">
                {/* Mobile View Card - Always in DOM, but visibility controlled by CSS */}
                <div className="md:hidden">
                    <Card className="w-full shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-6 w-6 text-primary" />
                                Certificado de Conclusão
                            </CardTitle>
                            <CardDescription>
                                Você concluiu o curso com sucesso!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="space-y-1">
                                <p className="font-semibold">Curso:</p>
                                <p className="text-muted-foreground">{courseName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold">Aluno(a):</p>
                                <p className="text-muted-foreground">{studentName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold">Data de Conclusão:</p>
                                <p className="text-muted-foreground">{formattedCompletionDate}</p>
                            </div>
                            <Button onClick={handleDownloadPdf} disabled={isDownloading} className="w-full mt-4" size="lg">
                                {isDownloading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                Baixar Certificado (PDF)
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Certificate for PDF Generation and Desktop View - Always in DOM */}
                <div className="absolute top-0 left-0 w-full -z-10 opacity-0 md:relative md:z-auto md:opacity-100">
                    <div id="certificate-wrapper" className="space-y-8">
                        {/* Frente do Certificado */}
                        <div id="certificate-front" className="certificate-page relative w-full aspect-[297/210] bg-white shadow-lg p-10 border-4 flex flex-col" style={{ borderColor: accentColor }}>
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
                                <header className="flex justify-between items-center pb-4 border-b-2 gap-4" style={{ borderColor: accentColor }}>
                                    <div className="flex items-center gap-4">
                                        {mainLogoUrl ? (
                                            <Image src={mainLogoUrl} alt="Logo da Empresa" width={150} height={60} objectFit="contain" data-ai-hint="company logo"/>
                                        ) : <span>{companyName}</span>}
                                        <Award className="h-12 w-12 hidden sm:block" style={{ color: accentColor }} />
                                    </div>
                                    <div className="text-right text-xs text-gray-600">
                                        <p className="font-bold">{companyName}</p>
                                        <p>{companyAddress}</p>
                                        <p>CNPJ: {companyCnpj}</p>
                                    </div>
                                </header>

                                <main className="flex-1 flex flex-col items-center justify-center text-center my-6">
                                    <h1 className="text-5xl font-bold font-headline" style={{ color: accentColor }}>Certificado de Conclusão</h1>
                                    <p className="mt-8 text-xl">Certificamos que</p>
                                    <p className="mt-2 text-4xl font-semibold font-serif tracking-wider">{studentName}</p>
                                    <p className="mt-2 text-lg">portador(a) do CPF nº {studentCpf}</p>
                                    <p className="mt-6 text-xl max-w-3xl">
                                        concluiu com sucesso o curso de <strong style={{ color: accentColor }}>{courseName}</strong>,
                                        em {formattedCompletionDate}.
                                    </p>
                                </main>

                                <footer className="mt-auto pt-4 flex justify-between items-end gap-8">
                                    <div className="text-center">
                                        <div className="w-64 h-12 mb-1 border-b-2 border-gray-700"></div>
                                        <p className="text-sm font-semibold mt-1">{studentName}</p>
                                    </div>
                                    <div className="text-center">
                                        {signatureUrl && <Image src={signatureUrl} alt="Assinatura" width={180} height={60} objectFit="contain" data-ai-hint="signature" className="mx-auto" />}
                                        <hr className="border-gray-700 mt-1 w-64 mx-auto"/>
                                        <p className="text-sm font-semibold mt-1">{signatureText}</p>
                                    </div>
                                </footer>
                            </div>
                        </div>

                        {/* Verso do Certificado */}
                        <div id="certificate-back" className="certificate-page relative w-full aspect-[297/210] bg-white shadow-lg p-10 border-4 flex flex-col mt-8" style={{ borderColor: accentColor }}>
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
                                <header className="text-center pb-4 mb-6">
                                    <h2 className="text-3xl font-bold font-headline" style={{ color: accentColor }}>Conteúdo Programático</h2>
                                    <div className="text-center mt-4">
                                        <p className="text-lg font-semibold">{studentName}</p>
                                        <p className="text-md text-gray-700">{courseName}</p>
                                    </div>
                                </header>

                                <main className="flex-1">
                                    <ul className="space-y-2 text-sm columns-2">
                                        {courseModules.map((module, index) => (
                                            <li key={module.id} className="text-gray-700 break-inside-avoid">{index + 1}. {module.title}</li>
                                        ))}
                                    </ul>
                                </main>
                                
                                <footer className="mt-auto pt-4 border-t flex justify-between items-end gap-4">
                                    <div className='text-left text-xs text-gray-600 space-y-1'>
                                        <p className="font-bold">Verificação de Autenticidade</p>
                                        <p>Aponte a câmera para o QR Code ou acesse o site de verificação.</p>
                                        <p>Código: <strong className='font-mono'>{verificationCode}</strong></p>
                                        {additionalInfo && <p className="mt-2">{additionalInfo}</p>}
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <Image 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verificationUrl)}`}
                                            width={100}
                                            height={100}
                                            alt="QR Code de Verificação"
                                        />
                                    </div>
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                @media print {
                    body, html {
                        background-color: #fff !important;
                    }
                    body > div:first-child > div {
                        padding: 0 !important;
                    }
                    body > div:first-child > div > div:first-child, /* Oculta botões de download e card mobile */
                    .md\\:hidden {
                        display: none !important;
                    }
                    .absolute.-z-10.opacity-0.md\\:relative {
                       opacity: 1 !important;
                       position: static !important;
                       z-index: auto !important;
                    }
                    #certificate-wrapper {
                        display: block !important;
                        opacity: 1 !important;
                        height: auto !important;
                        position: static !important;
                    }
                    .certificate-page {
                        width: 100% !important;
                        height: 100vh !important;
                        max-width: none !important;
                        border-width: 8px !important;
                        box-sizing: border-box !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        page-break-after: always;
                    }
                     .certificate-page:last-child {
                        page-break-after: avoid;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
                @page {
                    size: A4 landscape;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default Certificate;
