import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Collaboration() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Collaboration</h1>
      <Card>
        <CardHeader>
          <CardTitle>Team Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Work together with your team in real-time on transfer pricing documentation and analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
