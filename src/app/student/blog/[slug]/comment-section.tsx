
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { submitComment } from './actions';
import type { Comment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Comentar
        </Button>
    )
}


interface CommentSectionProps {
    postId: string;
    tenantId: string;
    initialComments: Comment[];
}

export function CommentSection({ postId, tenantId, initialComments }: CommentSectionProps) {
    const [user, loading] = useAuthState(auth);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const [state, formAction] = useActionState(submitComment, { success: false });

     useEffect(() => {
        if (state.message && !state.success) {
            toast({
                title: 'Erro!',
                description: state.message,
                variant: 'destructive',
            });
        }
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state, toast]);

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    return (
        <section className="space-y-8">
            <h2 className="font-headline text-2xl font-bold">Comentários ({initialComments.length})</h2>
            
            <div className="space-y-6">
                {initialComments.length > 0 ? initialComments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={comment.authorAvatarUrl ?? undefined} />
                            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-card p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold">{comment.authorName}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                            </div>
                            <p className="text-muted-foreground">{comment.text}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-muted-foreground text-center py-4">Seja o primeiro a comentar!</p>
                )}
            </div>

            {loading && <div className="flex justify-center"><Loader2 className="animate-spin"/></div>}

            {!loading && user && (
                 <form ref={formRef} action={formAction} className="flex items-start gap-4 pt-6 border-t">
                    <Avatar>
                        <AvatarImage src={user.photoURL ?? undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="w-full space-y-2">
                         <input type="hidden" name="postId" value={postId} />
                         <input type="hidden" name="tenantId" value={tenantId} />
                         <input type="hidden" name="userId" value={user.uid} />
                         <input type="hidden" name="userName" value={user.displayName ?? 'Aluno'} />
                         <input type="hidden" name="userAvatar" value={user.photoURL ?? ''} />
                         <Textarea name="commentText" placeholder="Escreva seu comentário..." rows={4} required/>
                         {state?.issues?.map(issue => <p key={issue} className="text-red-500 text-sm mt-1">{issue}</p>)}
                         <div className="text-right">
                            <SubmitButton />
                         </div>
                    </div>
                </form>
            )}

            {!loading && !user && (
                <div className="text-center py-6 border-t">
                    <p className="text-muted-foreground">Você precisa estar logado para comentar.</p>
                    <Button asChild variant="link"><Link href="/login">Fazer Login</Link></Button>
                </div>
            )}
        </section>
    )

}
