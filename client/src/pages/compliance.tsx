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
import { Link } from "wouter";
import type { ComplianceCheck } from "@db/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export default function Compliance() {
  const { data: checks } = useQuery<ComplianceCheck[]>({
    queryKey: ["/api/compliance-checks"],
  });

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your compliance requirements
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OECD Pillar Two</CardTitle>
          <CardDescription>
            Global minimum tax framework compliance and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Implementation Status</h3>
                <p className="text-sm text-muted-foreground">
                  Overall readiness: 75%
                </p>
              </div>
              <Link href="/compliance/pillar-two">
                <Button variant="outline">View Details</Button>
              </Link>
            </div>
            <Progress value={75} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <span>Income Inclusion Rule (IIR)</span>
                <StatusBadge status="completed" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <span>Undertaxed Payment Rule (UTPR)</span>
                <StatusBadge status="in-progress" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <span>Subject to Tax Rule (STTR)</span>
                <StatusBadge status="pending" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    {check.status === "compliant" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : check.status === "non-compliant" ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>{check.jurisdiction}</span>
                    <StatusBadge status={check.status as any} />
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