import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Team() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage your team members, roles, and permissions for the Transfer Pricing Intelligence Platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
