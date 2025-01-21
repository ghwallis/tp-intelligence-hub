import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuditManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audit Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage transfer pricing audits
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Audits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            View and manage your ongoing transfer pricing audits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
