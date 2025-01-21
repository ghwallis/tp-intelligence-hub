import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ControversyDocumentation() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Controversy Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Manage documentation related to transfer pricing controversies
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Access and manage documentation for ongoing controversies and disputes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
