'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getPurchaseHistory } from '@/lib/purchases';
import type { Purchase } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// Em uma aplicação multi-inquilino real, o ID do inquilino seria determinado dinamicamente.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default function StudentPurchasesPage() {
    const [user, authLoading] = useAuthState(auth);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getPurchaseHistory(MAIN_TENANT_ID, user.uid)
                .then(setPurchases)
                .catch(err => console.error("Failed to load purchase history", err))
                .finally(() => setIsLoading(false));
        } else if (!authLoading) {
            setIsLoading(false); // No user, stop loading
        }
    }, [user, authLoading]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };
    
    if (isLoading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Minhas Compras</h1>
                <p className="text-muted-foreground">Aqui está o histórico de todas as suas transações e inscrições.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>
                        Faturas de cursos comprados e inscrições em cursos gratuitos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchases.length > 0 ? purchases.map((purchase) => (
                                <TableRow key={purchase.id}>
                                    <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                                    <TableCell className="font-medium">
                                        <p>{purchase.courseTitle || 'Carregando nome do curso...'}</p>
                                        <p className="text-xs text-muted-foreground">ID da Transação: {purchase.id}</p>
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(purchase.amount)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Concluído</Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Você ainda não fez nenhuma compra ou inscrição.
                                         <Button variant="link" asChild><Link href="/student/explore">Explore nossos cursos</Link></Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}