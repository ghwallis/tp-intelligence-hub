import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";

export default function BEPSCompliance() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">BEPS Action Plans</h1>
          <p className="text-muted-foreground mt-2">
            BEPS Action 13 documentation and Action 8-10 value creation compliance
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="value-creation">Value Creation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Readiness</span>
                    <span className="text-sm">60%</span>
                  </div>
                  <Progress value={60} />
                </div>

                <div className="grid gap-4 mt-4">
                  <div className="flex items-center justify-between py-2">
                    <span>CbC Report</span>
                    <StatusBadge status="in-progress" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Master File</span>
                    <StatusBadge status="completed" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Local File</span>
                    <StatusBadge status="pending" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BEPS Action 13 Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Master File</h3>
                      <p className="text-sm text-muted-foreground">Organizational structure and global business overview</p>
                    </div>
                    <StatusBadge status="completed" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Local File</h3>
                      <p className="text-sm text-muted-foreground">Detailed transactional transfer pricing documentation</p>
                    </div>
                    <StatusBadge status="pending" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">CbC Report</h3>
                      <p className="text-sm text-muted-foreground">Annual reporting for each tax jurisdiction</p>
                    </div>
                    <StatusBadge status="in-progress" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="value-creation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BEPS Actions 8-10: Value Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Intangibles</h3>
                      <p className="text-sm text-muted-foreground">DEMPE analysis and valuation</p>
                    </div>
                    <StatusBadge status="in-progress" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Risk Allocation</h3>
                      <p className="text-sm text-muted-foreground">Risk analysis framework and control assessment</p>
                    </div>
                    <StatusBadge status="completed" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Capital Allocation</h3>
                      <p className="text-sm text-muted-foreground">Capital structure and funding analysis</p>
                    </div>
                    <StatusBadge status="upcoming" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
