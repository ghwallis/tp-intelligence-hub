import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentAnalysis } from "@/components/sentiment-analysis";
import { DocumentStructureAnalysis } from "@/components/document-structure-analysis";
import { useQuery } from "@tanstack/react-query";

export default function AIInsights() {
  const { data: recentAnalyses } = useQuery({
    queryKey: ['/api/documents/recent-analyses'],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">AI Insights</h1>
      <p className="text-muted-foreground">
        AI-powered analysis of your transfer pricing documents
      </p>

      {recentAnalyses?.length > 0 ? (
        <div className="grid gap-6">
          {recentAnalyses.map((analysis: any) => (
            <div key={analysis.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{analysis.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysis.metadata.sentimentAnalysis && (
                    <SentimentAnalysis analysis={analysis.metadata.sentimentAnalysis} />
                  )}
                  {analysis.metadata.documentStructure && (
                    <DocumentStructureAnalysis analysis={analysis.metadata.documentStructure} />
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              No document analyses yet. Upload documents to see AI-powered insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}