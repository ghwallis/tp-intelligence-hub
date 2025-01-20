import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Documentation() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Transfer Pricing Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will contain comprehensive documentation and guidelines for transfer pricing compliance and best practices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
