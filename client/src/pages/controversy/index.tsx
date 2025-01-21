import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "wouter";
import { X } from "lucide-react";

type Country = {
  name: string;
  totalAudits: number;
  riskLevel: "High" | "Medium" | "Low";
  totalExposure: string;
  auditStages: {
    initial: number;
    information: number;
    negotiation: number;
    closing: number;
  };
};

const mockData: Country[] = [
  {
    name: "Italy",
    totalAudits: 3,
    riskLevel: "High",
    totalExposure: "$11.90M",
    auditStages: {
      initial: 1,
      information: 1,
      negotiation: 0,
      closing: 1,
    },
  },
  {
    name: "France",
    totalAudits: 4,
    riskLevel: "Medium",
    totalExposure: "$12.80M",
    auditStages: {
      initial: 1,
      information: 2,
      negotiation: 1,
      closing: 0,
    },
  },
  {
    name: "Germany",
    totalAudits: 5,
    riskLevel: "High",
    totalExposure: "$15.20M",
    auditStages: {
      initial: 2,
      information: 1,
      negotiation: 1,
      closing: 1,
    },
  },
];

export default function ControversyPage() {
  const [, navigate] = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Overview</h1>
        <p className="text-muted-foreground">
          Monitor and manage transfer pricing audits across jurisdictions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockData.map((country) => (
          <Card key={country.name} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-bold">{country.name} - Audit Details</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">Total Audits</span>
                  <span className="text-2xl font-bold">{country.totalAudits}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  // Close button functionality
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Risk Level</span>
                  <Badge 
                    variant={country.riskLevel === "High" ? "destructive" : "secondary"}
                  >
                    {country.riskLevel}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Exposure</span>
                  <div className="text-xl font-bold">{country.totalExposure}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Audit Stages</div>
                <div className="flex w-full h-2 bg-muted rounded-full overflow-hidden">
                  {Object.entries(country.auditStages).map(([stage, count], index) => {
                    if (count === 0) return null;
                    const colors = ["bg-blue-500", "bg-yellow-500", "bg-orange-500", "bg-green-500"];
                    const total = Object.values(country.auditStages).reduce((a, b) => a + b, 0);
                    const width = (count / total) * 100;
                    return (
                      <div
                        key={stage}
                        className={`${colors[index]}`}
                        style={{ width: `${width}%` }}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-4 gap-1 mt-1 text-xs">
                  <div className="text-center">
                    <div>Initial</div>
                    <div className="font-medium">{country.auditStages.initial}</div>
                  </div>
                  <div className="text-center">
                    <div>Information</div>
                    <div className="font-medium">{country.auditStages.information}</div>
                  </div>
                  <div className="text-center">
                    <div>Negotiation</div>
                    <div className="font-medium">{country.auditStages.negotiation}</div>
                  </div>
                  <div className="text-center">
                    <div>Closing</div>
                    <div className="font-medium">{country.auditStages.closing}</div>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-4"
                onClick={() => navigate(`/controversy/audit/${country.name.toLowerCase()}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
