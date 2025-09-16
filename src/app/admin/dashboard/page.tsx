'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Newspaper, DollarSign, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, icon, isLoading }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-24" />
            ) : (
                <div className="text-2xl font-bold">{value}</div>
            )}
            {/* Placeholder for percentage change */}
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
        </CardContent>
    </Card>
);

export default function AdminDashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [stats, setStats] = useState({
      courses: 0,
      blogPosts: 0,
      students: 0, // Placeholder for students/users count
      revenue: "R$ 0,00" // Placeholder for revenue
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const tenantId = user.uid;

                const coursesCol = collection(db, `tenants/${tenantId}/courses`);
                const blogCol = collection(db, `tenants/${tenantId}/blog`);
                // Placeholder for students. A better approach would be to query a users collection associated with the tenant
                const studentsCol = collection(db, `tenants/${tenantId}/users`); 

                const [coursesCount, blogPostsCount] = await Promise.all([
                    getCountFromServer(coursesCol),
                    getCountFromServer(blogCol),
                    // getCountFromServer(studentsCol)
                ]);

                setStats(prev => ({
                    ...prev,
                    courses: coursesCount.data().count,
                    blogPosts: blogPostsCount.data().count,
                    // students: studentsCount.data().count
                }));
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    } else if (!loadingAuth) {
        setIsLoading(false); // No user, stop loading
    }
  }, [user, loadingAuth]);

  const statCards = [
    { title: "Receita Total", value: stats.revenue, icon: <DollarSign className="h-4 w-4 text-muted-foreground" />, isLoading: isLoading, key: 'revenue' },
    { title: "Alunos", value: stats.students, icon: <Users className="h-4 w-4 text-muted-foreground" />, isLoading: isLoading, key: 'students' },
    { title: "Cursos", value: stats.courses, icon: <BookOpen className="h-4 w-4 text-muted-foreground" />, isLoading: isLoading, key: 'courses' },
    { title: "Postagens no Blog", value: stats.blogPosts, icon: <Newspaper className="h-4 w-4 text-muted-foreground" />, isLoading: isLoading, key: 'blogPosts' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Painel</h1>
        <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo da sua empresa.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.key} title={stat.title} value={stat.value} icon={stat.icon} isLoading={stat.isLoading} />
        ))}
      </div>
      
      {/* More dashboard components can be added here */}
    </div>
  );
}