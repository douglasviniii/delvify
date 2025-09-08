import { BrandingForm } from "./branding-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Marca</h1>
        <p className="text-muted-foreground">Personalize a aparência do seu site de inquilino.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Assistente de Marca com IA</CardTitle>
            <CardDescription>
                Descreva como você quer que seu site se pareça. Por exemplo, "Quero um tema moderno e escuro com detalhes em azul" ou "Um visual profissional para um escritório de advocacia com um esquema de cores dourado e marinho".
            </CardDescription>
        </CardHeader>
        <BrandingForm />
      </Card>
    </div>
  );
}
