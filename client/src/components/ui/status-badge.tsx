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
    | "completed"
    | "draft"
    | "in-progress"
    | "pending"
    | "approved"
    | "rejected";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusClasses = {
    // Risk levels
    low: "status-success",
    medium: "status-warning",
    high: "status-danger",
    // Compliance statuses
    compliant: "status-success",
    "action-needed": "status-danger",
    // Deadline statuses
    upcoming: "status-warning",
    "past-due": "status-danger",
    completed: "status-success",
    // Document/workflow statuses
    draft: "status-muted",
    "in-progress": "status-warning",
    pending: "status-warning",
    approved: "status-success",
    rejected: "status-danger",
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