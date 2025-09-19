

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Globe, Info, MessageCircle } from "lucide-react";
import Link from 'next/link';

const policyLinks = [
    { href: "/privacy-policy", text: "Política de Privacidade" },
    { href: "/refund-policy", text: "Política de Cancelamento e Reembolso" },
    { href: "/terms-of-use", text: "Termo de Uso" },
    { href: "/cookie-policy", text: "Política de Cookies" },
    { href: "/support-policy", text: "Política de Atendimento e Suporte" },
    { href: "/copyright-policy", text: "Política de Direitos Autorais" }
];

export default function AdminSettingsPage() {
  return (
    <div className="h-full w-full space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações da Plataforma</h1>
        <p className="text-muted-foreground">Gerencie as configurações globais, políticas e informações de contato.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5"/> Idioma da Plataforma</CardTitle>
            <CardDescription>
                Selecione o idioma padrão para a interface de administração e para as páginas dos alunos.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="max-w-sm space-y-2">
                <Label htmlFor="language-select">Idioma</Label>
                <Select defaultValue="pt">
                    <SelectTrigger id="language-select">
                        <SelectValue placeholder="Selecione um idioma" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pt">Português (Brasil)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Políticas e Termos</CardTitle>
            <CardDescription>
                Acesse e edite o conteúdo das páginas de políticas da sua plataforma.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-2">
                {policyLinks.map(link => (
                    <li key={link.href}>
                         <Link href={`/admin/site-studio${link.href.startsWith('/') ? '' : '/'}${link.href.replace(/-/g, '_')}`} passHref>
                           <Button variant="link" className="p-0 h-auto">{link.text}</Button>
                        </Link>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Informações Legais e Denúncias</CardTitle>
            <CardDescription>
                Informações sobre a DelviFy, a plataforma que motoriza sua escola.
            </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-4">
           <p>
                A DelviFy é uma plataforma multi-inquilino de software como serviço (SaaS), e todos os direitos autorais e de propriedade intelectual pertencem à Delvind Tecnologia Da Informação LTDA.
            </p>
            <div className="space-y-1">
                <p><strong>Email:</strong> contato@delvind.com</p>
                <p><strong>Telefone:</strong> (45) 8800-0647</p>
                <p><strong>CNPJ:</strong> 57.278.676/0001-69</p>
            </div>
             <p>
                Caso identifique qualquer violação de direitos autorais, conteúdo inadequado ou qualquer outra irregularidade em alguma das escolas hospedadas em nossa plataforma, por favor, entre em contato imediatamente com nossa central de denúncias através do WhatsApp.
            </p>
            <Button asChild>
                <Link href="https://wa.me/554588000647" target="_blank">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Falar com a Central no WhatsApp
                </Link>
            </Button>
        </CardContent>
      </Card>

    </div>
  );
}
