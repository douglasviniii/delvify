
import { auth } from '@/lib/firebase';
import { getPurchaseHistory } from '@/lib/purchases';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Em uma aplicação multi-inquilino real, o ID do inquilino seria determinado dinamicamente (ex: pelo domínio).
// Para este contexto, usamos um ID de inquilino fixo onde os cursos/compras estão sendo criados.
const MAIN_TENANT_ID = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

export default async function StudentPurchasesPage() {
    // Esta é uma Server Component, então podemos verificar o usuário aqui.
    // A verificação real do usuário logado seria feita através de cookies/sessão.
    // O `auth.currentUser` do SDK do cliente não funciona no servidor.
    // Para este exemplo, vamos assumir que temos um ID de usuário.
    // Em um app real, você obteria isso de libs como next-auth ou da sessão do firebase-admin.
    
    // Placeholder para o ID do usuário. Em um app real, você não teria que codificar isso.
    const userId = "REPLACE_WITH_DYNAMIC_LOGGED_IN_USER_ID";
    // NOTE: A lógica de obtenção do usuário no servidor precisaria ser implementada.
    // Como estamos em um Server Component, não podemos usar hooks como `useAuthState`.
    // Por enquanto, usaremos um ID de usuário fixo para demonstração, assumindo que ele está logado.
    // O usuário de teste logado no sistema é `delvify@delvin.com` com o UID `LBb33EzFFvdOjYfT9Iw4eO4dxvp2`.
    const demoUserId = 'LBb33EzFFvdOjYfT9Iw4eO4dxvp2';

    if (!demoUserId) {
        redirect('/login');
    }

    const purchases = await getPurchaseHistory(MAIN_TENANT_ID, demoUserId);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const formatDate = (dateString: string) => {
        // Assegura que estamos tratando a data como UTC para evitar problemas de fuso horário na hidratação
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

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
