import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentProcessing() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Document Processing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is coming soon. Document processing will allow you to automate the extraction and analysis of transfer pricing data from your documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
