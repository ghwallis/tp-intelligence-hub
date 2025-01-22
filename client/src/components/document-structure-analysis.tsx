import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle, FileText, Info } from "lucide-react";
import { useState } from "react";

interface DocumentStructure {
  documentType: string;
  taxAuthority?: string;
  targetEntities?: string[];
  auditAreas?: string[];
  informationRequests?: string[];
  suggestedResponses?: string[];
  dataSourceRecommendations?: string[];
  keyDates?: { description: string; date: string; }[];
  additionalNotes?: string;
}

interface DocumentStructureAnalysisProps {
  analysis: DocumentStructure;
}

export function DocumentStructureAnalysis({ analysis }: DocumentStructureAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Document Analysis</CardTitle>
          <Badge variant="outline" className="capitalize">
            {analysis.documentType.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {analysis.taxAuthority && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Tax Authority
            </h4>
            <p className="text-sm text-muted-foreground">{analysis.taxAuthority}</p>
          </div>
        )}

        {analysis.targetEntities && analysis.targetEntities.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Target Entities</h4>
            <div className="space-y-1">
              {analysis.targetEntities.map((entity, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="mr-2 mb-2 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {entity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.auditAreas && analysis.auditAreas.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Audit Areas</h4>
            <div className="space-y-1">
              {analysis.auditAreas.map((area, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="mr-2 mb-2 bg-purple-50 text-purple-700 border-purple-200"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.keyDates && analysis.keyDates.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              Key Dates
            </h4>
            <div className="space-y-2">
              {analysis.keyDates.map((date, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{date.description}</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {date.date}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? "Show Less" : "Show More Details"}
        </button>

        {isExpanded && (
          <div className="space-y-6 pt-4">
            {analysis.informationRequests && analysis.informationRequests.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Information Requested</h4>
                <div className="space-y-2">
                  {analysis.informationRequests.map((request, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Info className="h-4 w-4 mt-1 flex-shrink-0 text-blue-500" />
                      <span>{request}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggestedResponses && analysis.suggestedResponses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Suggested Responses</h4>
                <div className="space-y-2">
                  {analysis.suggestedResponses.map((response, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0 text-green-500" />
                      <span>{response}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.dataSourceRecommendations && analysis.dataSourceRecommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recommended Data Sources</h4>
                <div className="space-y-2">
                  {analysis.dataSourceRecommendations.map((source, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="mr-2 mb-2 bg-green-50 text-green-700 border-green-200"
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.additionalNotes && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Additional Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {analysis.additionalNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
