import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Newspaper, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Revenue", value: "$45,231.89", icon: <DollarSign className="h-4 w-4 text-muted-foreground" /> },
    { title: "Active Users", value: "+2350", icon: <Users className="h-4 w-4 text-muted-foreground" /> },
    { title: "Courses", value: "+573", icon: <BookOpen className="h-4 w-4 text-muted-foreground" /> },
    { title: "Blog Posts", value: "+12", icon: <Newspaper className="h-4 w-4 text-muted-foreground" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s a summary of your tenant.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* More dashboard components can be added here */}
    </div>
  );
}
