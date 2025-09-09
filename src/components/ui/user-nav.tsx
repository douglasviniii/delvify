
'use client';

import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function UserNav() {
  return (
    <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificações</span>
        </Button>
    </div>
  );
}
