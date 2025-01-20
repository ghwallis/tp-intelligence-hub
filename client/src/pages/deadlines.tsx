import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Deadlines() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Deadlines</h1>
      <Card>
        <CardHeader>
          <CardTitle>Compliance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Track important deadlines and compliance dates for your transfer pricing documentation and filings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
