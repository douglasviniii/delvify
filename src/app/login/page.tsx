
import { redirect } from 'next/navigation';

// Esta página se tornou obsoleta pela nova estrutura [lang]/login
export default function ObsoleteLoginPage() {
  redirect('/');
}
