import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function APAManagement() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Advance Pricing Agreements</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track APAs across jurisdictions
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>APA Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Active APAs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">3</span>
                        <StatusBadge status="completed" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pending Renewals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">2</span>
                        <StatusBadge status="upcoming" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">New Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">1</span>
                        <StatusBadge status="in-progress" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      jurisdiction: "Netherlands",
                      type: "Bilateral",
                      period: "2022-2026",
                      status: "active"
                    },
                    {
                      jurisdiction: "Singapore",
                      type: "Unilateral",
                      period: "2023-2027",
                      status: "active"
                    },
                    {
                      jurisdiction: "UK",
                      type: "Bilateral",
                      period: "2021-2025",
                      status: "active"
                    }
                  ].map((apa, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{apa.jurisdiction}</h3>
                        <p className="text-sm text-muted-foreground">
                          {apa.type} APA | Period: {apa.period}
                        </p>
                      </div>
                      <StatusBadge status="completed" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      jurisdiction: "UK",
                      deadline: "Dec 2024",
                      status: "upcoming"
                    },
                    {
                      jurisdiction: "Netherlands",
                      deadline: "Jun 2025",
                      status: "upcoming"
                    }
                  ].map((renewal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{renewal.jurisdiction}</h3>
                        <p className="text-sm text-muted-foreground">
                          Renewal Deadline: {renewal.deadline}
                        </p>
                      </div>
                      <StatusBadge status={renewal.status} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Ireland</h3>
                      <p className="text-sm text-muted-foreground">
                        Bilateral APA Application
                      </p>
                    </div>
                    <StatusBadge status="in-progress" />
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
