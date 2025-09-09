

import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { getGlobalSettingsForTenant } from '@/lib/settings';
import CoursesClientContent from "./courses-client-content";
import { getAllCourses, getAllCategories, type Course, type Category } from "@/lib/courses";

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function CoursesPage() {
    const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);
    const courses: Course[] = await getAllCourses(MAIN_TENANT_ID);
    const categories: Category[] = await getAllCategories(MAIN_TENANT_ID);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader settings={settings} />
            <main className="flex-1">
                <CoursesClientContent allCourses={courses} allCategories={categories} />
            </main>
            <MainFooter />
        </div>
    );
}
