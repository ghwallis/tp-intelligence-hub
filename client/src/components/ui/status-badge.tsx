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
  // Map statuses to semantic states
  const statusClasses = {
    // Success states - Green
    low: "status-success",
    compliant: "status-success",
    completed: "status-success",
    approved: "status-success",

    // Warning states - Yellow
    medium: "status-warning",
    upcoming: "status-warning",
    "in-progress": "status-warning",
    pending: "status-warning",

    // Danger states - Red
    high: "status-danger",
    "action-needed": "status-danger",
    "past-due": "status-danger",
    rejected: "status-danger",

    // Neutral state - Grey
    draft: "status-muted",
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