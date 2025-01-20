import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Transfer Pricing Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This dashboard will provide detailed analytics and insights into your transfer pricing data and compliance metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
