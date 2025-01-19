import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for audit status
const auditData = [
  { country: "Germany", status: "High", amount: "$15.20M", activeAudits: 5 },
  { country: "France", status: "Medium", amount: "$12.80M", activeAudits: 4 },
  { country: "UK", status: "Low", amount: "$8.50M", activeAudits: 3 },
  { country: "Italy", status: "High", amount: "$11.90M", activeAudits: 3 },
  { country: "Spain", status: "Medium", amount: "$7.20M", activeAudits: 2 },
];

// Mock data for compliance metrics
const documentationMetrics = [
  { name: "Master File", value: 100 },
  { name: "Local Files", value: 92 },
  { name: "CbC Report", value: 90 },
];

const policyMetrics = [
  { name: "Transfer Pricing", value: 95 },
  { name: "Intercompany", value: 85 },
  { name: "Risk Management", value: 84 },
];

const transactionMetrics = [
  { name: "Services", value: 98 },
  { name: "Tangibles", value: 95 },
  { name: "Intangibles", value: 95 },
];

// Mock data for regional risk assessment
const regions = [
  {
    name: "EMEA",
    riskScore: 85,
    exposure: "€52.3M",
    countries: [
      { name: "Germany", status: "High" },
      { name: "France", status: "Medium" },
      { name: "UK", status: "Low" },
    ],
  },
  {
    name: "Americas",
    riskScore: 48,
    exposure: "€4.3M",
    countries: [
      { name: "USA", status: "Medium" },
      { name: "Brazil", status: "High" },
      { name: "Canada", status: "Low" },
    ],
  },
  {
    name: "APAC",
    riskScore: 52,
    exposure: "€49.8M",
    countries: [
      { name: "China", status: "High" },
      { name: "Japan", status: "Low" },
      { name: "Singapore", status: "Low" },
    ],
  },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Global TP Dashboard</h1>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across 12 jurisdictions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Global Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tax Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$145.20M</div>
            <p className="text-xs text-muted-foreground">Under current audits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Audit Status */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Status by Country</CardTitle>
            <CardDescription>Current audit stages and progress across jurisdictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditData.map((country) => (
                <div key={country.country} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">{country.country}</span>
                      <Badge
                        variant={country.status === "High" ? "destructive" : country.status === "Medium" ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {country.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {country.activeAudits} Active Audits
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{country.amount}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Metrics</CardTitle>
            <CardDescription>Key compliance indicators and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Documentation</h4>
                <Badge>Compliant</Badge>
              </div>
              <div className="space-y-2">
                {documentationMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{metric.name}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Policies</h4>
                <Badge variant="outline">Action Needed</Badge>
              </div>
              <div className="space-y-2">
                {policyMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{metric.name}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Transactions</h4>
                <Badge>Compliant</Badge>
              </div>
              <div className="space-y-2">
                {transactionMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{metric.name}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Global Risk Assessment</CardTitle>
            <CardDescription>Transfer pricing risk levels by jurisdiction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {regions.map((region) => (
                <div key={region.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{region.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        Risk Score: {region.riskScore}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Exposure: {region.exposure}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {region.countries.map((country) => (
                      <div key={country.name} className="flex justify-between items-center">
                        <span className="text-sm">{country.name}</span>
                        <Badge
                          variant={country.status === "High" ? "destructive" : country.status === "Medium" ? "default" : "secondary"}
                        >
                          {country.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Critical dates and submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" className="rounded-md border" />
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Germany</h4>
                  <p className="text-sm text-muted-foreground">Local File • 2024-01-15</p>
                </div>
                <Badge>Upcoming</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">France</h4>
                  <p className="text-sm text-muted-foreground">CbC Report • 2024-01-20</p>
                </div>
                <Badge>Upcoming</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}