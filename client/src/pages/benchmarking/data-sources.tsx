import { DataSources } from "@/components/data-sources";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BenchmarkingDataSources() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Benchmarking Data Sources</h1>
        <p className="text-muted-foreground">
          Manage your external data sources and connections for benchmarking analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>
            Connect and manage external data sources for benchmarking analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataSources />
        </CardContent>
      </Card>
    </div>
  );
}
