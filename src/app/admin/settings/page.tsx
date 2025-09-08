import { BrandingForm } from "./branding-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Branding</h1>
        <p className="text-muted-foreground">Customize the look and feel of your tenant site.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">AI Branding Assistant</CardTitle>
            <CardDescription>
                Describe how you want your site to look. For example, "I want a modern, dark theme with blue accents" or "A professional look for a law firm with a gold and navy color scheme".
            </CardDescription>
        </CardHeader>
        <BrandingForm />
      </Card>
    </div>
  );
}
