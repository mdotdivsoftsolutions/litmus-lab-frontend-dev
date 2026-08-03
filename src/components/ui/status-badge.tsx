import { Badge } from "@/components/ui/badge";

type StatusType = "Pending" | "Approved" | "Rejected" | "Completed" | "In Progress" | "Active" | "Inactive" | "Verified" | "Pending Verification" | "Report Ready" | "Payment Pending" | "Payment Success";

const statusVariantMap: Record<string, "pending" | "approved" | "rejected" | "completed" | "inprogress" | "default" | "secondary"> = {
  "Pending": "pending",
  "Pending Verification": "pending",
  "Payment Pending": "pending",
  "Approved": "approved",
  "Active": "approved",
  "Verified": "approved",
  "Payment Success": "approved",
  "Rejected": "rejected",
  "Inactive": "rejected",
  "Completed": "completed",
  "In Progress": "inprogress",
  "Report Ready": "pending",
};

export function StatusBadge({ status }: { status: StatusType | string }) {
  const variant = statusVariantMap[status] || "default";
  return (
    <Badge variant={variant} className="gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}
