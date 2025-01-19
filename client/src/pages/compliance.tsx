import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { ComplianceCheck } from "@db/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function Compliance() {
  const { data: checks } = useQuery<ComplianceCheck[]>({
    queryKey: ["/api/compliance-checks"],
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant":
        return "bg-green-500";
      case "non-compliant":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const jurisdictions = Array.from(
    new Set(checks?.map((check) => check.jurisdiction))
  );

  const calculateComplianceRate = (jurisdiction: string) => {
    const jurisdictionChecks = checks?.filter(
      (check) => check.jurisdiction === jurisdiction
    );
    const compliantChecks = jurisdictionChecks?.filter(
      (check) => check.status.toLowerCase() === "compliant"
    );
    return (
      ((compliantChecks?.length || 0) / (jurisdictionChecks?.length || 1)) * 100
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jurisdictions.map((jurisdiction) => (
          <Card key={jurisdiction}>
            <CardHeader>
              <CardTitle>{jurisdiction}</CardTitle>
              <CardDescription>
                Compliance Rate: {calculateComplianceRate(jurisdiction).toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                value={calculateComplianceRate(jurisdiction)}
                className="h-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {checks?.map((check) => (
              <AccordionItem key={check.id} value={check.id.toString()}>
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    {getStatusIcon(check.status)}
                    <span>{check.jurisdiction}</span>
                    <Badge
                      variant="secondary"
                      className={`ml-auto ${getStatusColor(check.status)}`}
                    >
                      {check.status}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {Object.entries(check.requirements as Record<string, any>).map(
                      ([requirement, details]) => (
                        <div key={requirement} className="space-y-2">
                          <h4 className="font-medium">{requirement}</h4>
                          <p className="text-sm text-muted-foreground">
                            {details as string}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
