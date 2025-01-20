import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VersionControl() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Version Control</h1>
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Track and manage versions of your transfer pricing documentation with advanced version control features.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
