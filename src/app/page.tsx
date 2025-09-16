
import { redirect } from 'next/navigation';

export default function RootPage() {
  // A lógica de redirecionamento agora está no middleware.
  // Esta página pode redirecionar para uma página de aterrissagem padrão ou a página de login, se necessário.
  redirect('/login');
}
