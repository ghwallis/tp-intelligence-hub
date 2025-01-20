import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";

export default function EUATAD() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">EU Anti-Tax Avoidance Directive</h1>
          <p className="text-muted-foreground mt-2">
            Monitor CFC rules and hybrid mismatch compliance
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cfc">CFC Rules</TabsTrigger>
          <TabsTrigger value="hybrid">Hybrid Mismatches</TabsTrigger>
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
                    <span className="text-sm font-medium">Overall Compliance</span>
                    <span className="text-sm">75%</span>
                  </div>
                  <Progress value={75} />
                </div>

                <div className="grid gap-4 mt-4">
                  <div className="flex items-center justify-between py-2">
                    <span>CFC Rules Implementation</span>
                    <StatusBadge status="completed" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span>Hybrid Mismatch Rules</span>
                    <StatusBadge status="in-progress" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cfc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controlled Foreign Company Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Low-Tax Entities Identification</h3>
                      <p className="text-sm text-muted-foreground">Identification and monitoring of low-taxed entities</p>
                    </div>
                    <StatusBadge status="completed" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Control Assessment</h3>
                      <p className="text-sm text-muted-foreground">Analysis of control and ownership structures</p>
                    </div>
                    <StatusBadge status="completed" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Income Attribution</h3>
                      <p className="text-sm text-muted-foreground">CFC income calculation and attribution rules</p>
                    </div>
                    <StatusBadge status="in-progress" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hybrid" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hybrid Mismatch Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Hybrid Entity Assessment</h3>
                      <p className="text-sm text-muted-foreground">Identification of hybrid entity arrangements</p>
                    </div>
                    <StatusBadge status="in-progress" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Financial Instruments</h3>
                      <p className="text-sm text-muted-foreground">Analysis of hybrid financial instruments</p>
                    </div>
                    <StatusBadge status="pending" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Impact Assessment</h3>
                      <p className="text-sm text-muted-foreground">Evaluation of tax treatment differences</p>
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
