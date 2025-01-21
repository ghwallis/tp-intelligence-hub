import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function DisputeResolution() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dispute Resolution</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track dispute resolution processes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Monitor and manage ongoing dispute resolution cases.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
