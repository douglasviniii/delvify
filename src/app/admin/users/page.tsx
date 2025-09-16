
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Users, DollarSign, BookOpen, Edit, StickyNote, XCircle, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { UserProfile, Course, PurchasedCourseInfo } from '@/lib/types';
import { getPurchasedCourses } from '@/lib/courses';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


type Student = UserProfile & {
    courses: Course[];
    purchaseDetails: Record<string, PurchasedCourseInfo>;
    totalSpent: number;
    status: 'active' | 'inactive'; // Assuming status is tracked on user doc
};

const DescriptionListItem = ({ term, children }: { term: string, children: React.ReactNode }) => (
    <div className="flex flex-col py-3 px-4 odd:bg-muted/50 sm:flex-row sm:gap-4">
        <dt className="w-1/3 font-medium text-foreground">{term}</dt>
        <dd className="mt-1 text-muted-foreground sm:mt-0 sm:w-2/3">{children || '-'}</dd>
    </div>
);

const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


export default function AdminUsersPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // Step 1: Find all users who purchased a course from this tenant
        const purchasesSnapshot = await getDocs(collection(db, `tenants/${user.uid}/purchases`));
        const studentIds = new Set<string>();
        purchasesSnapshot.forEach(doc => {
          studentIds.add(doc.data().userId);
        });

        // Step 2: For each unique student, fetch their profile and course data
        const studentPromises = Array.from(studentIds).map(async (studentId) => {
            const userDocSnap = await getDoc(doc(db, 'users', studentId));
            if (!userDocSnap.exists()) return null;

            const userProfile = userDocSnap.data() as UserProfile;
            const { courses, details } = await getPurchasedCourses(studentId);
            
            // Filter courses to only include those from the current tenant
            const tenantCourses = courses.filter(c => details[c.id]?.tenantId === user.uid);
            
            const totalSpent = tenantCourses.reduce((acc, course) => {
                 const price = details[course.id]?.price || 0;
                 return acc + price;
            }, 0);


            return {
                ...userProfile,
                courses: tenantCourses,
                purchaseDetails: details,
                totalSpent: totalSpent,
                status: (userProfile as any).status || 'active'
            } as Student;
        });

        const resolvedStudents = await Promise.all(studentPromises);
        setStudents(resolvedStudents.filter((s): s is Student => s !== null));

      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  const handleManageStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  

  if (isLoading || loadingAuth) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Alunos</h1>
            <p className="text-muted-foreground">Gerencie todos os alunos da sua plataforma.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Aluno
        </Button>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Lista de Alunos</CardTitle>
              <CardDescription>Visualize e gerencie os alunos que compraram seus cursos.</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(student => (
                            <TableRow key={student.uid}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={student.photoURL || undefined} alt={student.socialName} />
                                            <AvatarFallback>{student.socialName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{student.socialName}</div>
                                            <div className="text-xs text-muted-foreground">{student.name}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>
                                    <Badge variant={student.status === 'active' ? 'default' : 'destructive'}>
                                        {student.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações do Aluno</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleManageStudent(student)}>
                                                <Edit className="mr-2 h-4 w-4" /> Gerenciar Aluno
                                            </DropdownMenuItem>
                                             {student.status === 'active' ? (
                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                    <XCircle className="mr-2 h-4 w-4" /> Desativar Aluno
                                                </DropdownMenuItem>
                                             ) : (
                                                <DropdownMenuItem>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Reativar Aluno
                                                </DropdownMenuItem>
                                             )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex h-[40vh] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                         <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="text-xl font-semibold mt-4">Nenhum Aluno Encontrado</h2>
                        <p className="text-muted-foreground mt-2">Seus alunos aparecerão aqui assim que comprarem um curso.</p>
                    </div>
                </div>
            )}
          </CardContent>
      </Card>
      
      {selectedStudent && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={selectedStudent.photoURL || undefined} alt={selectedStudent.socialName} />
                            <AvatarFallback>{selectedStudent.socialName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                       <span>Gerenciando: {selectedStudent.socialName}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="details" className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="details">Detalhes</TabsTrigger>
                            <TabsTrigger value="courses">Cursos Adquiridos</TabsTrigger>
                            <TabsTrigger value="financial">Financeiro</TabsTrigger>
                            <TabsTrigger value="notes">Anotações</TabsTrigger>
                        </TabsList>
                        <div className="flex-1 overflow-auto">
                            <TabsContent value="details" className="py-4 px-1">
                                <dl className="divide-y divide-border border rounded-lg overflow-hidden">
                                    <DescriptionListItem term="Nome Completo">{selectedStudent.name}</DescriptionListItem>
                                    <DescriptionListItem term="Nome Social">{selectedStudent.socialName}</DescriptionListItem>
                                    <DescriptionListItem term="Email">{selectedStudent.email}</DescriptionListItem>
                                    <DescriptionListItem term="CPF">{selectedStudent.cpf}</DescriptionListItem>
                                    <DescriptionListItem term="Data de Nascimento">{formatDate(selectedStudent.birthDate)}</DescriptionListItem>
                                    <DescriptionListItem term="Endereço">{`${selectedStudent.address}, ${selectedStudent.neighborhood}, ${selectedStudent.city} - ${selectedStudent.state}, ${selectedStudent.cep}`}</DescriptionListItem>
                                </dl>
                            </TabsContent>
                            <TabsContent value="courses" className="py-4 px-1">
                                 <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Curso</TableHead>
                                            <TableHead>Data da Compra</TableHead>
                                            <TableHead className="text-right">Valor Pago</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedStudent.courses.map(course => (
                                            <TableRow key={course.id}>
                                                <TableCell className="font-medium">{course.title}</TableCell>
                                                <TableCell>{formatDate(selectedStudent.purchaseDetails[course.id]?.purchasedAt)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(selectedStudent.purchaseDetails[course.id]?.price || 0)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                             <TabsContent value="financial" className="py-4 px-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5"/>Resumo Financeiro</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                            <span className="font-medium">Total Gasto na Plataforma</span>
                                            <span className="text-2xl font-bold">{formatCurrency(selectedStudent.totalSpent)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                             <TabsContent value="notes" className="py-4 px-1">
                                 <Card>
                                     <CardHeader>
                                         <CardTitle className="text-lg flex items-center gap-2"><StickyNote className="h-5 w-5"/>Anotações Internas</CardTitle>
                                         <CardDescription>Estas anotações são visíveis apenas para os administradores.</CardDescription>
                                     </CardHeader>
                                     <CardContent>
                                         <Textarea rows={8} placeholder="Adicione uma anotação sobre este aluno..."/>
                                         <Button className="mt-4">Salvar Anotação</Button>
                                     </CardContent>
                                 </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
