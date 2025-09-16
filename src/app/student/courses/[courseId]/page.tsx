
import { notFound } from 'next/navigation';
import { getCourseById, getCourseReviews, hasPurchasedCourse } from '@/lib/courses';
import { getCurrentUser } from '@/lib/session'; // Usando a sessão para pegar o usuário no servidor
import CourseDetailsClient from './course-details-client';
import type { Course, Review } from '@/lib/types';

// Este é o ID do inquilino para o qual os cursos estão sendo criados no admin.
const TENANT_ID_WITH_COURSES = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function StudentCourseDetailsPage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId as string;
    
    // 1. Fetch data on the server
    const user = await getCurrentUser();

    // Se não houver usuário, a lógica no layout já redireciona, mas é uma boa prática verificar.
    if (!user) {
        // O ideal é que o middleware ou layout cuide do redirecionamento.
        // Se chegarmos aqui, é um estado inesperado.
        return null;
    }

    const [course, reviews, isPurchased] = await Promise.all([
        getCourseById(TENANT_ID_WITH_COURSES, courseId),
        getCourseReviews(TENANT_ID_WITH_COURSES, courseId),
        hasPurchasedCourse(user.uid, courseId)
    ]);
    
    if (!course) {
        notFound();
    }
    
    // 2. Pass data to the Client Component
    return (
        <CourseDetailsClient 
            course={course}
            initialReviews={reviews}
            initialIsPurchased={isPurchased}
            user={{
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Aluno',
            }}
        />
    );
}
