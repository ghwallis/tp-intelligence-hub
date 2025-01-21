import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function TimelineTracker() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Timeline Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Track important dates and milestones in controversy cases
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Timelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              View and manage timelines for ongoing controversy cases.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
