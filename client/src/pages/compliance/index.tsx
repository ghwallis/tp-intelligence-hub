import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Compliance() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Compliance</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor compliance across different regulatory frameworks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/compliance/beps">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>BEPS Action Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor and manage BEPS Action 13 documentation and Action 8-10 value creation compliance
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/compliance/eu-atad">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>EU ATAD</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track implementation of EU Anti-Tax Avoidance Directive requirements
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
