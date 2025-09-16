
import { redirect } from 'next/navigation';

// Esta página se tornou obsoleta pela nova estrutura [lang]/login.
// Apenas redireciona para a raiz para permitir que o middleware controle o roteamento.
export default function ObsoleteLoginPage() {
  redirect('/');
}
