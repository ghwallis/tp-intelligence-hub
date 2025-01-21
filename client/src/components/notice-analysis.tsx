import { AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NoticeAnalysisProps {
  analysis: {
    summary: string;
    keyIssues: string[];
    suggestedResponses: string[];
    requiredDocuments: string[];
    riskAssessment: {
      level: "low" | "medium" | "high";
      factors: string[];
    };
  };
}

export function NoticeAnalysis({ analysis }: NoticeAnalysisProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notice Analysis</CardTitle>
          <Badge className={cn("ml-2", getRiskLevelColor(analysis.riskAssessment.level))}>
            Risk Level: {analysis.riskAssessment.level.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          AI-powered analysis of the notice content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Summary</h4>
            <p className="text-sm text-muted-foreground">
              {analysis.summary}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Key Issues</h4>
            <div className="space-y-2">
              {analysis.keyIssues.map((issue, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 block"
                >
                  {issue}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
            <div className="space-y-2">
              {analysis.riskAssessment.factors.map((factor, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 block"
                >
                  <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                  {factor}
                </Badge>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDetails ? "Show Less" : "Show More Details"}
          </button>

          {showDetails && (
            <div className="space-y-4 pt-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Suggested Responses</h4>
                <div className="space-y-2">
                  {analysis.suggestedResponses.map((response, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 block"
                    >
                      <CheckCircle className="h-3 w-3 inline-block mr-1" />
                      {response}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Required Documentation</h4>
                <div className="space-y-2">
                  {analysis.requiredDocuments.map((doc, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200 block"
                    >
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
