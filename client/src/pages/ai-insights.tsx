import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIInsights() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">AI Insights</h1>
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Leverage artificial intelligence to gain deeper insights into your transfer pricing data and identify potential risks and opportunities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
