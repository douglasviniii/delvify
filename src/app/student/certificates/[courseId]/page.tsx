
import { getCertificatePageData } from './actions';
import { CertificateClient } from './certificate-client';
import { notFound, redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/session'; 


// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

// Um componente de loading para usar com Suspense
function LoadingCertificate() {
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando dados do certificado...</p>
        </div>
    );
}

// O componente principal da página agora é um Server Component que busca os dados
async function CertificateDataFetcher({ courseId }: { courseId: string }) {
    // Busca o usuário logado no servidor.
    const user = await getCurrentUser();

    if (!user) {
        // Redireciona para o login se não houver usuário.
        // O ideal é passar um `callbackUrl` para que o usuário retorne após o login.
        return redirect(`/login?callbackUrl=/student/certificates/${courseId}`);
    }

    const result = await getCertificatePageData(TENANT_ID_WITH_COURSES, courseId, user.uid);

    if (!result.success) {
        return <CertificateClient data={null} error={result.message} />;
    }

    return <CertificateClient data={result.data} error={null} />;
}


export default function CertificatePage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;

    if (!courseId) {
        notFound();
    }
    
    return (
        <Suspense fallback={<LoadingCertificate />}>
            <CertificateDataFetcher courseId={courseId} />
        </Suspense>
    );
}
