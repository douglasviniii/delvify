
import { MainHeader } from "@/components/main-header";
import { getGlobalSettingsForTenant } from '@/lib/settings';
import { getAllCourses, getAllCategories } from "@/lib/courses";
import type { Course, Category } from '@/lib/types';
import ExploreClientContent from "./explore-client-content";


const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function ExplorePage() {
    const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);
    const courses: Course[] = await getAllCourses(MAIN_TENANT_ID);
    const categories: Category[] = await getAllCategories(MAIN_TENANT_ID);

    return (
        <ExploreClientContent allCourses={courses} allCategories={categories} />
    );
}
