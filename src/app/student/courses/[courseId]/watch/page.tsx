
import { notFound } from 'next/navigation';
import { getCourseById, getCourseModules } from '@/lib/courses';
import CourseViewer from '../course-viewer';

// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function StudentCourseWatchPage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    
    // TODO: Add logic to check if user has purchased the course
    
    const course = await getCourseById(TENANT_ID_WITH_COURSES, courseId);
    
    if (!course) {
        notFound();
    }

    const modules = await getCourseModules(TENANT_ID_WITH_COURSES, courseId);

    return (
       <CourseViewer course={course} modules={modules} />
    );
}
