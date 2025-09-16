
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, Newspaper, DollarSign, HandCoins, PiggyBank, TrendingDown, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { getTenantPurchases } from '@/lib/purchases';
import { getFinancialSettings } from '../companies/financial-settings-actions';
import type { Purchase, FinancialSettings } from '@/lib/types';


const formatCurrency = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}


const StatCard = ({ title, value, description, icon, isLoading }: { title: string, value: string | number, description?: string, icon: React.ReactNode, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <>
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </>
            )}
        </CardContent>
    </Card>
);

export default function AdminDashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [stats, setStats] = useState({
      courses: 0,
      blogPosts: 0,
      students: 0,
      totalRevenue: 0,
      totalDelvifyFees: 0,
      totalTaxesAndGateway: 0,
      netRevenue: 0,
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
                const studentsCol = collection(db, `tenants/${tenantId}/users`); // Placeholder

                const [coursesCount, blogPostsCount, purchases, financialSettings] = await Promise.all([
                    getCountFromServer(coursesCol),
                    getCountFromServer(blogCol),
                    getTenantPurchases(tenantId),
                    getFinancialSettings()
                ]);
                
                let totalRevenue = 0;
                let totalDelvifyFees = 0;
                let totalTaxes = 0;
                let totalGatewayFees = 0;

                if (financialSettings) {
                    purchases.forEach(purchase => {
                        const saleValue = purchase.amount;
                        totalRevenue += saleValue;

                        const taxValue = saleValue * (financialSettings.taxPercentage / 100);
                        totalTaxes += taxValue;

                        const valueAfterTaxes = saleValue - taxValue;
                        
                        let stripeFee = 0;
                        if(purchase.paymentMethod === 'card') {
                            stripeFee = valueAfterTaxes * (financialSettings.stripeCardPercentage / 100) + financialSettings.stripeCardFixed;
                        } else if (purchase.paymentMethod === 'boleto') {
                            stripeFee = financialSettings.stripeBoletoFixed;
                        } else if (purchase.paymentMethod === 'pix') {
                            stripeFee = valueAfterTaxes * (financialSettings.stripePixPercentage / 100);
                        }
                        totalGatewayFees += stripeFee;
                        
                        const valueAfterStripe = valueAfterTaxes - stripeFee;
                        const delvifyFee = valueAfterStripe * (financialSettings.delvifyPercentage / 100) + financialSettings.delvifyFixed;
                        totalDelvifyFees += delvifyFee;
                    });
                }
                
                const netRevenue = totalRevenue - totalGatewayFees - totalTaxes - totalDelvifyFees;


                setStats({
                    courses: coursesCount.data().count,
                    blogPosts: blogPostsCount.data().count,
                    students: 0, // Placeholder
                    totalRevenue,
                    totalDelvifyFees,
                    totalTaxesAndGateway: totalTaxes + totalGatewayFees,
                    netRevenue,
                });

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    } else if (!loadingAuth) {
        setIsLoading(false);
    }
  }, [user, loadingAuth]);
  
  const statCards = [
    { title: "Faturamento Bruto", value: formatCurrency(stats.totalRevenue), description: "Total de vendas na sua plataforma.", icon: <DollarSign className="h-4 w-4 text-muted-foreground" />, key: 'revenue' },
    { title: "Taxas da Plataforma", value: formatCurrency(stats.totalDelvifyFees), description: "Taxa de serviço DelviFy.", icon: <TrendingDown className="h-4 w-4 text-muted-foreground" />, key: 'delvify' },
    { title: "Impostos e Taxas Gateway", value: formatCurrency(stats.totalTaxesAndGateway), description: "Taxas de pagamento e impostos retidos.", icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />, key: 'taxes' },
    { title: "Líquido a Receber", value: formatCurrency(stats.netRevenue), description: "Valor estimado a ser repassado.", icon: <HandCoins className="h-4 w-4 text-muted-foreground" />, key: 'net' },
  ];
  
  const otherCards = [
     { title: "Alunos", value: stats.students, icon: <Users className="h-4 w-4 text-muted-foreground" />, isLoading: isLoading, key: 'students' },
     { title: "Cursos", value: stats.courses, icon: <BookOpen className="h-4 w-4 text-muted-foreground" />, isLoading: isLoading, key: 'courses' },
     { title: "Postagens no Blog", value: stats.blogPosts, icon: <Newspaper className="h-4 w-4 text-muted-foreground" />, isLoading: isLoading, key: 'blogPosts' },
  ]


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Painel</h1>
        <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo da sua empresa.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.key} title={stat.title} value={stat.value} description={stat.description} icon={stat.icon} isLoading={isLoading} />
        ))}
      </div>
      
       <div className="grid gap-4 md:grid-cols-3">
         {otherCards.map((stat) => (
          <Card key={stat.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
