import { useState } from "react";
import { useBenchmarking } from "@/hooks/use-benchmarking";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { BarChart, Bar } from "recharts";
import { DataSources } from "@/components/data-sources";

// Mock data for the profit indicators chart
const profitData = [
  { month: "Jan", value: 45 },
  { month: "Feb", value: 42 },
  { month: "Mar", value: 47 },
  { month: "Apr", value: 44 },
  { month: "May", value: 46 },
  { month: "Jun", value: 48 },
];

// Mock data for risk assessment
const riskData = [
  { name: "Business/Model Competitiveness", value: 85 },
  { name: "Compliance Score", value: 65 },
  { name: "Audit Risk", value: 45 },
];

// Mock data for financial ratios
const mockFinancialRatios = [
  { name: "Operating Margin", value: 15.2 },
  { name: "Return on Assets", value: 8.5 },
  { name: "Working Capital", value: 12.4 },
  { name: "Debt to Equity", value: 1.8 },
];

export default function Benchmarking() {
  const { comparables, analyses, isLoading, addComparable, createAnalysis } = useBenchmarking();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      industry: "",
      region: "",
      size: "",
      financialData: {
        revenue: 0,
        operatingProfit: 0,
        totalAssets: 0,
        employeeCount: 0,
      },
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await addComparable(data);
      setAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to add comparable:", error);
    }
  };

  const handleCreateAnalysis = async () => {
    if (!comparables?.length) return;

    const comparableIds = comparables.map(c => c.id);
    const financialRatios = calculateFinancialRatios(comparables);
    const rejectionMatrix = generateRejectionMatrix(comparables);
    const quartileRanges = calculateQuartileRanges(financialRatios);

    await createAnalysis({
      comparableIds,
      financialRatios,
      rejectionMatrix,
      quartileRanges,
    });
  };

  const metrics = [
    {
      title: "Operating Margin",
      value: "15.2%",
      description: "Year to date",
    },
    {
      title: "Net Rate",
      value: "1.24%",
      description: "Quarter average",
    },
    {
      title: "Gross Margin",
      value: "8.5%",
      description: "Current period",
    },
    {
      title: "Return Rate",
      value: "22.4%",
      description: "Annual projection",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Benchmarking Analysis</h1>
          <p className="text-muted-foreground">Compare your transfer pricing metrics against industry standards</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Comparable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Comparable Company</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Add Company
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            onClick={handleCreateAnalysis}
            disabled={!comparables?.length}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Run Analysis
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profit Level Indicators Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Profit Level Indicators</CardTitle>
            <CardDescription>Compare with industry benchmarks over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Overall scoring and indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {riskData.map((risk) => (
              <div key={risk.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{risk.name}</span>
                  <span className="font-medium">{risk.value}%</span>
                </div>
                <Progress value={risk.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Comparable Companies</CardTitle>
            <CardDescription>
              Selected companies for benchmarking analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Region</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparables?.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>{company.region}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Ratios</CardTitle>
            <CardDescription>
              Key financial metrics comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyses?.[0]?.financialRatios || mockFinancialRatios}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>
            Manage your benchmarking data sources and connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataSources />
        </CardContent>
      </Card>
    </div>
  );
}

// Utility functions for financial calculations
function calculateFinancialRatios(companies: any[]) {
  // Implementation for calculating financial ratios
  return [];
}

function generateRejectionMatrix(companies: any[]) {
  // Implementation for generating rejection matrix
  return {};
}

function calculateQuartileRanges(ratios: any[]) {
  // Implementation for calculating quartile ranges
  return {};
}