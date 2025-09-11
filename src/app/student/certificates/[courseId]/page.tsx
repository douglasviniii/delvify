
import { notFound, redirect } from 'next/navigation';
import { getCourseById, getCourseModules } from '@/lib/courses';
import { getCertificateSettings, type CertificateSettings } from '@/lib/certificates';
import Certificate from '@/components/certificate';
import { adminDb } from '@/lib/firebase-admin';
import type { User } from 'firebase-admin/auth';


// Placeholder for getting the real logged-in user on the server.
// This would be replaced by a proper session management system.
const getAuthenticatedUser = async () => {
    // In a real app, this would involve validating a session cookie or token.
    // For this example, we'll simulate fetching a user.
    // This UID corresponds to the student user created in the signup flow.
    // Replace with a real user UID from your Firebase project to test.
    const studentUID = "A2e8sD4fG6hJkLpQ7wE9xYz2vN1o"; 

     try {
        const userDoc = await adminDb.collection('users').doc(studentUID).get();
        if (userDoc.exists) {
            return userDoc.data() as User;
        }
        return null;
    } catch(e) {
        return null;
    }
}

// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function CertificatePage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;

    // Fetch all data in parallel for better performance
    const [course, modules, certificateSettings, student] = await Promise.all([
        getCourseById(TENANT_ID_WITH_COURSES, courseId),
        getCourseModules(TENANT_ID_WITH_COURSES, courseId),
        getCertificateSettings(TENANT_ID_WITH_COURSES),
        getAuthenticatedUser()
    ]);
    
    if (!course || !student) {
        notFound();
    }

    // TODO: Add logic to verify if the student has actually completed the course.
    // For now, we assume if they can access the page, they are eligible.
    
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
            <Certificate
                studentName={student.displayName || 'Aluno Sem Nome'}
                courseName={course.title}
                completionDate={new Date()} // Using current date as placeholder
                courseModules={modules}
                settings={certificateSettings}
            />
        </div>
    );
}
