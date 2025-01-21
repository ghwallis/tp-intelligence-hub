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
    | "rejected"
    | "active"; // Added for APA status
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Map statuses to semantic states
  const statusClasses = {
    // Success states - Green
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    compliant: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",

    // Warning states - Yellow
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    upcoming: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",

    // Danger states - Red
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    "action-needed": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    "past-due": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",

    // Neutral state - Grey
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
  };

  const label = status.split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      statusClasses[status],
      className
    )}>
      {label}
    </span>
  );
}