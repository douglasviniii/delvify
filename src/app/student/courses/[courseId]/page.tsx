

import { notFound } from 'next/navigation';
import { getCourseById, getCourseModules } from '@/lib/courses';
import CourseContent from '@/app/courses/[courseId]/course-content';


// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
// Em uma aplicação multi-domínio real, você resolveria isso com base no hostname da requisição.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';


export default async function StudentCoursePage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    
    // TODO: Add logic to check if user has purchased the course
    
    const course = await getCourseById(TENANT_ID_WITH_COURSES, courseId);
    
    // A verificação de status 'published' pode ser removida ou alterada aqui
    // dependendo se o aluno pode ver cursos de rascunho que comprou.
    if (!course) {
        notFound();
    }

    const modules = await getCourseModules(TENANT_ID_WITH_COURSES, courseId);

    return (
       <CourseContent course={course} modules={modules} />
    );
}
