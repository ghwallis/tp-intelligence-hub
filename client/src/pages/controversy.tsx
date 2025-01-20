import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Controversy() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Controversy Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is coming soon. Controversy management will help you track and manage transfer pricing disputes and audits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
