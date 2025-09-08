"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitBrandingRequest } from "./actions";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        "Generating..."
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Theme
        </>
      )}
    </Button>
  );
}

export function BrandingForm() {
  const { toast } = useToast();
  const initialState = { message: "", fields: { instructions: "" } };
  const [state, formAction] = useFormState(submitBrandingRequest, initialState);

  useEffect(() => {
    if (state.message === "success") {
      toast({
        title: "Theme Generated!",
        description: "Your new theme suggestions are ready.",
      });
    } else if (state.message && state.message !== "success") {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instructions">Branding Instructions</Label>
          <Textarea
            id="instructions"
            name="instructions"
            placeholder="e.g., A clean and professional theme with a dark sidebar and green as the primary color."
            rows={5}
            defaultValue={state.fields?.instructions}
            required
          />
          {state.issues && (
            <p className="text-sm text-destructive">{state.issues.join(", ")}</p>
          )}
        </div>

        {state.data && (
            <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                <div>
                    <h3 className="font-semibold">Explanation</h3>
                    <p className="text-sm text-muted-foreground">{state.data.explanation}</p>
                </div>
                <div>
                    <h3 className="font-semibold">Suggested Theme (JSON)</h3>
                    <pre className="mt-2 w-full overflow-x-auto rounded-md bg-background p-4 text-sm">
                        <code>{state.data.suggestedThemeSettings}</code>
                    </pre>
                </div>
            </div>
        )}

        {useFormStatus().pending && (
           <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                <div>
                    <h3 className="font-semibold">Explanation</h3>
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </div>
                <div>
                    <h3 className="font-semibold">Suggested Theme (JSON)</h3>
                    <Skeleton className="h-24 w-full mt-2" />
                </div>
            </div>
        )}

      </CardContent>
      <CardFooter>
        <SubmitButton />
      </CardFooter>
    </form>
  );
}
