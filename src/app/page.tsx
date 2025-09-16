
import { redirect } from 'next/navigation';

export default function RootPage() {
  // O middleware irá interceptar o redirecionamento e adicionar o prefixo de idioma correto.
  // Por exemplo, /login se tornará /pt/login.
  redirect('/login');
}
