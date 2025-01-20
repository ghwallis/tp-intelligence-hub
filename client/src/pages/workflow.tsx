import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Workflow() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Workflow</h1>
      <Card>
        <CardHeader>
          <CardTitle>Process Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage and automate your transfer pricing workflows with our integrated process management system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
