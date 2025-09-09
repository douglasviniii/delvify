

import { notFound, redirect } from 'next/navigation';
import { getCourseById, getCourseModules } from '@/lib/courses';
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { MainHeader } from '@/components/main-header';
import { MainFooterWrapper as MainFooter } from '@/components/main-footer';
import CourseContent from './course-content';
import { auth } from '@/lib/firebase';
import { getApps } from 'firebase/app';
import { getServerSession } from "next-auth"; // Assuming you will use NextAuth.js
import { getCurrentUser } from '@/lib/session';


// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
// Em uma aplicação multi-domínio real, você resolveria isso com base no hostname da requisição.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';


export default async function CoursePage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // TODO: Add logic to check if user has purchased the course
    
    const course = await getCourseById(TENANT_ID_WITH_COURSES, courseId);
    if (!course || course.status !== 'published') {
        notFound();
    }

    const modules = await getCourseModules(TENANT_ID_WITH_COURSES, courseId);
    const settings = await getGlobalSettingsForTenant(TENANT_ID_WITH_COURSES);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader settings={settings} />
            <main className="flex-1">
                <CourseContent course={course} modules={modules} />
            </main>
            <MainFooter />
        </div>
    );
}
