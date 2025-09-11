
import { getCurrentUser } from '@/lib/session'; // Assumindo que você tem um helper de sessão
import { CertificateClient } from './certificate-client';
import { notFound } from 'next/navigation';

// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function CertificatePage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;

    if (!courseId) {
        notFound();
    }
    
    // Em um app real, o UID viria de uma sessão de servidor.
    // Como estamos usando firebase-hooks no cliente, podemos deixar o cliente lidar com isso.
    // O componente cliente obterá o UID do useAuthState.
    
    return <CertificateClient courseId={courseId} tenantId={TENANT_ID_WITH_COURSES} />;
}
