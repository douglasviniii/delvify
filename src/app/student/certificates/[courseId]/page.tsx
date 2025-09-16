'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import CertificateClient from './certificate-client';
import { getCertificateData } from './actions';
import { Button } from '@/components/ui/button';

function LoadingState() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando dados do certificado...</p>
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
     return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 p-4 text-center">
           <ShieldAlert className="h-16 w-16 text-destructive" />
           <h1 className="mt-4 text-2xl font-bold text-destructive">Não foi possível gerar o certificado</h1>
           <p className="mt-2 text-muted-foreground max-w-md">{message}</p>
           <Button onClick={() => window.history.back()} className="mt-6">Voltar</Button>
       </div>
    )
}

export default function CertificatePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const router = useRouter();
    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();

    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (authLoading) return;
        
        if (!user) {
            const callbackUrl = encodeURIComponent(`/student/certificates/${courseId}`);
            router.push(`/login?callbackUrl=${callbackUrl}`);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getCertificateData(user.uid, courseId);
                if (!result.success) {
                    setError(result.message);
                } else {
                    setData(result.data);
                }
            } catch (e: any) {
                setError(e.message || "Ocorreu um erro inesperado ao buscar os dados.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [user, authLoading, courseId, router, toast]);

    if (isLoading || authLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }
    
    if (!data) {
        return <ErrorState message="Não foram encontrados dados para gerar o certificado." />;
    }

    return (
        <CertificateClient 
            studentName={data.studentProfile.name}
            studentCpf={data.studentProfile.cpf}
            courseName={data.course.title}
            courseDurationHours={data.course.durationHours}
            purchaseDate={data.purchaseInfo.purchasedAt}
            courseModules={data.modules}
            settings={data.settings}
        />
    );
}
