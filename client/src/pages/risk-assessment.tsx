import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { RiskAssessment } from "@db/schema";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export default function RiskAssessment() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);

  const { data: assessments } = useQuery<RiskAssessment[]>({
    queryKey: ["/api/risk-assessments"],
  });

  const jurisdictionData = assessments?.filter(
    (a) => !selectedJurisdiction || a.jurisdiction === selectedJurisdiction
  );

  const riskMetrics = jurisdictionData?.[0]?.metrics || {};
  const chartData = Object.entries(riskMetrics).map(([name, value]) => ({
    metric: name,
    value: value as number,
  }));

  const jurisdictions = Array.from(
    new Set(assessments?.map((a) => a.jurisdiction) || [])
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Risk Assessment</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>
              Visualization of key risk indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full flex items-center justify-center">
              <RadarChart width={500} height={400} data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Risk Level"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {jurisdictions.map((jurisdiction) => {
            const assessment = assessments?.find(
              (a) => a.jurisdiction === jurisdiction
            );
            return (
              <Card
                key={jurisdiction}
                className={`cursor-pointer transition ${
                  selectedJurisdiction === jurisdiction
                    ? "border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() =>
                  setSelectedJurisdiction(
                    selectedJurisdiction === jurisdiction ? null : jurisdiction
                  )
                }
              >
                <CardHeader>
                  <CardTitle className="text-lg">{jurisdiction}</CardTitle>
                  <CardDescription>
                    Risk Level: {assessment?.riskLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(assessment?.metrics || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {key}
                          </span>
                          <span className="font-medium">{value}%</span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
