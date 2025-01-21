import { Card, CardContent } from "@/components/ui/card";

export default function ControversyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Controversy Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage transfer pricing controversies and audits
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p>Select an option from the sidebar to get started.</p>
        </CardContent>
      </Card>
    </div>
  );
}