import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Circle, TrendingDown, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SentimentAnalysisProps {
  analysis: {
    sentiment: "positive" | "negative" | "neutral";
    score: number;
    keyDrivers: string[];
    riskIndicators: string[];
    complianceTone: string;
    analysis: string;
  };
}

export function SentimentAnalysis({ analysis }: SentimentAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sentiment Analysis</CardTitle>
          <Badge className={cn("ml-2", getSentimentColor(analysis.sentiment))}>
            <span className="flex items-center gap-1">
              {getSentimentIcon(analysis.sentiment)}
              {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
            </span>
          </Badge>
        </div>
        <CardDescription>
          Document sentiment and risk analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sentiment Score</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(analysis.score * 100)}%
            </span>
          </div>
          <Progress value={analysis.score * 100} className="h-2" />
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Key Drivers</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.keyDrivers.map((driver, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {driver}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Risk Indicators</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.riskIndicators.map((risk, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {risk}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Compliance Tone</h4>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {analysis.complianceTone}
            </Badge>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? "Show Less" : "Show Detailed Analysis"}
            </button>
            {isExpanded && (
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                {analysis.analysis}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
