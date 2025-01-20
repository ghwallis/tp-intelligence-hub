import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";

export default function PillarTwo() {
  const [activeTab, setActiveTab] = useState("overview");

  const readinessStatus = {
    iir: "completed", // Income Inclusion Rule
    utpr: "in-progress", // Undertaxed Payment Rule
    sttr: "pending", // Subject to Tax Rule
  };

  const checklistItems = [
    { label: "Data collection framework established", status: "completed" },
    { label: "ETR calculation methodology defined", status: "completed" },
    { label: "Top-up tax calculation process", status: "in-progress" },
    { label: "STTR implementation planning", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">OECD Pillar Two</h1>
          <p className="text-muted-foreground mt-2">
            Global minimum tax framework compliance and analysis
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculator">GloBE Calculator</TabsTrigger>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pillar Two Readiness Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Current status of your organization's Pillar Two implementation
              </p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Readiness</span>
                    <span className="text-sm">75%</span>
                  </div>
                  <Progress value={75} />
                </div>

                <div className="grid gap-4 mt-4">
                  <div className="flex items-center justify-between py-2">
                    <span>Income Inclusion Rule (IIR)</span>
                    <StatusBadge status={readinessStatus.iir} />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Undertaxed Payment Rule (UTPR)</span>
                    <StatusBadge status={readinessStatus.utpr} />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Subject to Tax Rule (STTR)</span>
                    <StatusBadge status={readinessStatus.sttr} />
                  </div>
                </div>

                <div className="border rounded-lg p-4 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Implementation Checklist</h3>
                  <div className="space-y-3">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
                        <StatusBadge status={item.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>GloBE Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Calculate effective tax rates and top-up taxes under the GloBE rules
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Effective tax rate calculation</li>
                  <li>Top-up tax computation</li>
                  <li>Jurisdiction-by-jurisdiction reporting</li>
                  <li>Safe harbor analysis</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  GloBE Calculator to be implemented. This will include the above functionality.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jurisdictions">
          <Card>
            <CardHeader>
              <CardTitle>Jurisdiction Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Detailed analysis of tax implications across jurisdictions
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Jurisdiction-specific tax rates</li>
                  <li>STTR applicability assessment</li>
                  <li>Top-up tax allocation</li>
                  <li>Risk assessment by jurisdiction</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Jurisdiction Analysis to be implemented. This will include the above functionality.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
