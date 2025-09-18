
import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import CoursesClientContent from "@/app/courses/courses-client-content";
import { getAllCourses, getAllCategories } from "@/lib/courses";
import type { Course, Category } from '@/lib/types';

export default async function CoursesPage({ params }: { params: { tenantId: string } }) {
    const { tenantId } = params;
    const courses: Course[] = await getAllCourses(tenantId);
    const categories: Category[] = await getAllCategories(tenantId);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader />
            <main className="flex-1">
                <CoursesClientContent allCourses={courses} allCategories={categories} />
            </main>
            <MainFooter />
        </div>
    );
}
