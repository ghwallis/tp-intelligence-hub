import { DocumentGenerationForm } from "@/components/document-generation-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentGenerate() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Generate Transfer Pricing Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentGenerationForm />
        </CardContent>
      </Card>
    </div>
  );
}