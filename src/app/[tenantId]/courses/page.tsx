
import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import CoursesClientContent from "@/app/courses/courses-client-content";
import { getAllCourses, getAllCategories } from "@/lib/courses";
import type { Course, Category } from '@/lib/types';
import { getGlobalSettingsForTenant } from "@/lib/settings";

export default async function CoursesPage({ params }: { params: { tenantId: string } }) {
    const { tenantId } = params;
    const [courses, categories, settings] = await Promise.all([
        getAllCourses(tenantId),
        getAllCategories(tenantId),
        getGlobalSettingsForTenant(tenantId)
    ]);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader settings={settings} />
            <main className="flex-1">
                <CoursesClientContent allCourses={courses} allCategories={categories} />
            </main>
            <MainFooter settings={settings} />
        </div>
    );
}
