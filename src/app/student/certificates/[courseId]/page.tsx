
import { notFound } from 'next/navigation';
import { getCourseById, getCourseModules, hasPurchasedCourse } from '@/lib/courses';
import { getCertificateSettings } from '@/lib/certificates';
import type { CertificateSettings, Module } from '@/lib/types';
import Certificate from '@/components/certificate';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';


// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

async function getAuthenticatedUser() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return null;
    }
    try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
        if (userDoc.exists) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Failed to verify session cookie or fetch user", error);
        return null;
    }
}


export default async function CertificatePage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    
    const student = await getAuthenticatedUser();

    if (!student || !student.uid) {
         notFound();
    }
    
    // Fetch all data in parallel for better performance
    const [course, modules, certificateSettings, isPurchased] = await Promise.all([
        getCourseById(TENANT_ID_WITH_COURSES, courseId),
        getCourseModules(TENANT_ID_WITH_COURSES, courseId),
        getCertificateSettings(TENANT_ID_WITH_COURSES),
        hasPurchasedCourse(student.uid, courseId)
    ]);
    
    if (!course || !isPurchased) {
        notFound();
    }

    // TODO: Add logic to verify if the student has actually completed the course.
    // For now, we assume if they can access the page, they are eligible.
    
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
            <Certificate
                studentName={student.name || 'Aluno Sem Nome'}
                courseName={course.title}
                completionDate={new Date()} // Using current date as placeholder
                courseModules={modules}
                settings={certificateSettings}
            />
        </div>
    );
}
