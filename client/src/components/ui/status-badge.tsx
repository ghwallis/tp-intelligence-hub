import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 
    | "low" 
    | "medium" 
    | "high"
    | "compliant"
    | "action-needed"
    | "upcoming"
    | "past-due"
    | "completed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusClasses = {
    // Risk levels
    low: "risk-low",
    medium: "risk-medium",
    high: "risk-high",
    // Compliance statuses
    compliant: "compliance-compliant",
    "action-needed": "compliance-action-needed",
    // Deadline statuses
    upcoming: "deadline-upcoming",
    "past-due": "deadline-past-due",
    completed: "deadline-completed",
  };

  const label = status.split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");

  return (
    <span className={cn("status-badge", statusClasses[status], className)}>
      {label}
    </span>
  );
}
