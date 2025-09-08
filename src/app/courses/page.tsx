

import { MainHeader } from "@/components/main-header";
import { MainFooterWrapper as MainFooter } from "@/components/main-footer";
import { getGlobalSettingsForTenant } from '@/lib/settings';
import CoursesClientContent from "./courses-client-content";

const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

// Mock Data for Courses - should be consistent with home page
const allMockCourses = [
    { id: 1, title: 'Desenvolvimento Web Moderno com React', category: 'DEV', price: 'R$ 499', imageUrl: 'https://picsum.photos/300/200?random=1', rating: 4.8, students: 1250, dataAiHint: "web development" },
    { id: 2, title: 'Marketing Digital para Iniciantes', category: 'MKT', price: 'R$ 299', imageUrl: 'https://picsum.photos/300/200?random=2', rating: 4.5, students: 890, dataAiHint: "digital marketing" },
    { id: 3, title: 'UI/UX Design Essencial', category: 'DESIGN', price: 'R$ 399', imageUrl: 'https://picsum.photos/300/200?random=3', rating: 4.9, students: 2100, dataAiHint: "ui ux design" },
    { id: 4, title: 'Gestão de Projetos com Metodologias Ágeis', category: 'GESTÃO', price: 'R$ 599', imageUrl: 'https://picsum.photos/300/200?random=4', rating: 4.7, students: 980, dataAiHint: "project management" },
    { id: 5, title: 'Introdução à Inteligência Artificial', category: 'IA', price: 'R$ 699', imageUrl: 'https://picsum.photos/300/200?random=5', rating: 4.9, students: 3500, dataAiHint: "artificial intelligence" },
    { id: 6, title: 'Fotografia Digital para Redes Sociais', category: 'FOTO', price: 'R$ 249', imageUrl: 'https://picsum.photos/300/200?random=6', rating: 4.6, students: 750, dataAiHint: "photography" },
    { id: 7, title: 'Finanças Pessoais e Investimentos', category: 'FINANÇAS', price: 'R$ 349', imageUrl: 'https://picsum.photos/300/200?random=7', rating: 4.8, students: 1800, dataAiHint: "personal finance" },
    { id: 8, title: 'Desenvolvimento de Apps com Flutter', category: 'DEV', price: 'R$ 549', imageUrl: 'https://picsum.photos/300/200?random=8', rating: 4.7, students: 1100, dataAiHint: "mobile development" },
    { id: 9, title: 'Copywriting e Escrita Persuasiva', category: 'MKT', price: 'R$ 399', imageUrl: 'https://picsum.photos/300/200?random=9', rating: 4.8, students: 1500, dataAiHint: "copywriting" },
    { id: 10, title: 'Design de Sistemas para Entrevistas', category: 'DEV', price: 'R$ 799', imageUrl: 'https://picsum.photos/300/200?random=10', rating: 4.9, students: 4200, dataAiHint: "system design" },
    { id: 11, title: 'Edição de Vídeo com DaVinci Resolve', category: 'VIDEO', price: 'R$ 449', imageUrl: 'https://picsum.photos/300/200?random=11', rating: 4.7, students: 1300, dataAiHint: "video editing" },
    { id: 12, title: 'Análise de Dados com Python e Pandas', category: 'DADOS', price: 'R$ 599', imageUrl: 'https://picsum.photos/300/200?random=12', rating: 4.8, students: 2800, dataAiHint: "data analysis" },
];

export default async function CoursesPage() {
    const settings = await getGlobalSettingsForTenant(MAIN_TENANT_ID);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <MainHeader settings={settings} />
            <main className="flex-1">
                <CoursesClientContent allCourses={allMockCourses} />
            </main>
            <MainFooter />
        </div>
    );
}