import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Compliance Risk Heat Map</CardTitle>
        <CardDescription>AI-generated risk assessment across different compliance areas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {data.map((item, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg transition-colors duration-200",
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
