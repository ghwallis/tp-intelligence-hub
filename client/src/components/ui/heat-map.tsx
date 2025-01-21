import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface RiskScore {
  area: string;
  score: number;
  description: string;
}

interface HeatMapProps {
  data: RiskScore[];
  className?: string;
}

export function HeatMap({ data, className }: HeatMapProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskScore | null>(null);

  // Fetch detailed explanation when a risk area is selected
  const { data: explanation, isLoading } = useQuery({
    queryKey: ['/api/compliance/risk-explanation', selectedRisk?.area, selectedRisk?.score],
    queryFn: async () => {
      if (!selectedRisk) return null;

      const response = await fetch('/api/compliance/risk-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: selectedRisk.area,
          score: selectedRisk.score
        }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch explanation');
      return response.json();
    },
    enabled: !!selectedRisk
  });

  // Function to determine color based on risk score (0-100)
  const getColor = (score: number) => {
    if (score >= 80) return "bg-red-500/90";
    if (score >= 60) return "bg-orange-500/80";
    if (score >= 40) return "bg-yellow-500/70";
    if (score >= 20) return "bg-green-500/60";
    return "bg-green-500/50";
  };

  // Function to determine text color based on background
  const getTextColor = (score: number) => {
    return score >= 40 ? "text-white" : "text-gray-900";
  };

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Compliance Risk Heat Map</CardTitle>
          <CardDescription>AI-generated risk assessment across different compliance areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {data.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedRisk(item)}
                className={cn(
                  "p-4 rounded-lg transition-colors duration-200 hover:opacity-90",
                  getColor(item.score)
                )}
              >
                <h3 className={cn("font-semibold mb-1", getTextColor(item.score))}>
                  {item.area}
                </h3>
                <div className={cn("text-2xl font-bold mb-2", getTextColor(item.score))}>
                  {item.score}%
                </div>
                <p className={cn("text-sm", getTextColor(item.score))}>
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRisk} onOpenChange={(open) => !open && setSelectedRisk(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{selectedRisk?.area} Risk Analysis</DialogTitle>
          </DialogHeader>

          <ScrollArea className="px-6 max-h-[calc(80vh-8rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : explanation ? (
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="font-semibold mb-2">Detailed Analysis</h3>
                  <p className="text-sm text-muted-foreground">{explanation.detailed_analysis}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Required Actions</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {explanation.mitigation_steps.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">{step}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Potential Impact</h3>
                  <p className="text-sm text-muted-foreground">{explanation.impact_analysis}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {explanation.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </ScrollArea>

          <div className="flex justify-end p-6 pt-4 border-t">
            <Button onClick={() => setSelectedRisk(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}