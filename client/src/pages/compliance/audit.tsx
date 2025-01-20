import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { SearchFilter, type SearchFilters } from "@/components/search-filter";

type Audit = {
  jurisdiction: string;
  period: string;
  stage: string;
  status: string;
};

type Dispute = {
  jurisdiction: string;
  type: string;
  issue: string;
  status: string;
};

type Resolution = {
  jurisdiction: string;
  outcome: string;
  date: string;
  status: string;
};

const mockAudits: Audit[] = [
  {
    jurisdiction: "Germany",
    period: "2020-2022",
    stage: "Information Request",
    status: "in-progress"
  },
  {
    jurisdiction: "France",
    period: "2019-2021",
    stage: "Field Audit",
    status: "action-needed"
  }
];

const mockDisputes: Dispute[] = [
  {
    jurisdiction: "Italy",
    type: "MAP",
    issue: "Profit Attribution",
    status: "in-progress"
  },
  {
    jurisdiction: "Spain",
    type: "Domestic Appeal",
    issue: "Transfer Pricing Method",
    status: "action-needed"
  }
];

const mockResolutions: Resolution[] = [
  {
    jurisdiction: "Belgium",
    outcome: "Favorable Settlement",
    date: "Dec 2023",
    status: "completed"
  },
  {
    jurisdiction: "Sweden",
    outcome: "MAP Agreement",
    date: "Nov 2023",
    status: "completed"
  }
];

export default function AuditManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [filteredAudits, setFilteredAudits] = useState(mockAudits);
  const [filteredDisputes, setFilteredDisputes] = useState(mockDisputes);
  const [filteredResolutions, setFilteredResolutions] = useState(mockResolutions);

  const handleFilterChange = (filters: SearchFilters) => {
    // Filter audits based on search criteria
    const filteredAuditResults = mockAudits.filter((audit) => {
      const matchesKeyword = filters.keyword
        ? Object.values(audit).some((value) =>
            value.toLowerCase().includes(filters.keyword.toLowerCase())
          )
        : true;

      const matchesStatus = filters.status === "all" 
        ? true 
        : audit.status === filters.status;

      const matchesDate = !filters.dateFrom || !filters.dateTo 
        ? true 
        : true; // Add date filtering logic when we have actual dates

      return matchesKeyword && matchesStatus && matchesDate;
    });

    // Apply similar filtering to disputes and resolutions
    const filteredDisputeResults = mockDisputes.filter((dispute) =>
      Object.values(dispute).some((value) =>
        value.toLowerCase().includes(filters.keyword.toLowerCase())
      )
    );

    const filteredResolutionResults = mockResolutions.filter((resolution) =>
      Object.values(resolution).some((value) =>
        value.toLowerCase().includes(filters.keyword.toLowerCase())
      )
    );

    setFilteredAudits(filteredAuditResults);
    setFilteredDisputes(filteredDisputeResults);
    setFilteredResolutions(filteredResolutionResults);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audit & Dispute Resolution</h1>
          <p className="text-muted-foreground mt-2">
            Track audits and manage dispute resolution processes
          </p>
        </div>
      </div>

      <SearchFilter onFilterChange={handleFilterChange} />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-audits">Active Audits</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Active Audits</h3>
                      <p className="text-sm text-muted-foreground">Ongoing tax authority examinations</p>
                    </div>
                    <StatusBadge status="in-progress" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Open Disputes</h3>
                      <p className="text-sm text-muted-foreground">Unresolved matters</p>
                    </div>
                    <StatusBadge status="action-needed" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">Resolved Cases</h3>
                      <p className="text-sm text-muted-foreground">Successfully closed matters</p>
                    </div>
                    <StatusBadge status="completed" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-audits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Audit Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {filteredAudits.map((audit, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{audit.jurisdiction}</h3>
                        <p className="text-sm text-muted-foreground">
                          Period: {audit.period} | Stage: {audit.stage}
                        </p>
                      </div>
                      <StatusBadge status={audit.status} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {filteredDisputes.map((dispute, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{dispute.jurisdiction}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dispute.type} | Issue: {dispute.issue}
                        </p>
                      </div>
                      <StatusBadge status={dispute.status} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolutions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Resolutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {filteredResolutions.map((resolution, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{resolution.jurisdiction}</h3>
                        <p className="text-sm text-muted-foreground">
                          {resolution.outcome} | {resolution.date}
                        </p>
                      </div>
                      <StatusBadge status={resolution.status} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}