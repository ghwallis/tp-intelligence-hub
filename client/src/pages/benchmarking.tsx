import { useState } from "react";
import { useBenchmarking } from "@/hooks/use-benchmarking";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Calculator } from "lucide-react";

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

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Benchmarking Analysis</h1>
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
                  {/* Add other form fields for financial data */}
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
              <BarChart data={analyses?.[0]?.financialRatios || []}>
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
