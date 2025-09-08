import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground">Manage your courses, modules, and lessons.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="flex h-[50vh] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
            <h2 className="text-xl font-semibold">No Courses Yet</h2>
            <p className="text-muted-foreground mt-2">Click "Add Course" to get started.</p>
        </div>
      </div>
    </div>
  );
}
