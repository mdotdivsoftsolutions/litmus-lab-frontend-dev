import { cn } from "@/lib/utils";

type StatusType = 
  | "Pending" | "PENDING"
  | "Approved" | "APPROVED"
  | "Rejected" | "REJECTED"
  | "Completed" | "COMPLETED"
  | "In Progress" | "IN_PROGRESS" | "INPROGRESS"
  | "Active" | "ACTIVE"
  | "Inactive" | "INACTIVE"
  | "Verified" | "VERIFIED"
  | "Pending Verification" | "PENDING_VERIFICATION"
  | "Pending Approval" | "PENDING_APPROVAL"
  | "Report Ready" | "REPORT_READY"
  | "Sample Collected" | "SAMPLE_COLLECTED"
  | "Payment Pending" | "PAYMENT_PENDING"
  | "Payment Success" | "PAYMENT_SUCCESS" | "PAID";

export function StatusBadge({ status, className }: { status: StatusType | string; className?: string }) {
  if (!status) return null;

  const normalized = status.toString().toUpperCase().replace(/[\s-]+/g, "_");

  let label = status.toString();
  let styleClass = "bg-slate-50 text-slate-700 border-slate-200/80";
  let dotClass = "bg-slate-400";

  switch (normalized) {
    case "APPROVED":
    case "ACTIVE":
    case "VERIFIED":
    case "PAYMENT_SUCCESS":
    case "PAID":
    case "SUCCESS":
      label = normalized === "PAID" || normalized === "PAYMENT_SUCCESS" ? "Paid" : normalized === "ACTIVE" ? "Active" : normalized === "VERIFIED" ? "Verified" : "Approved";
      styleClass = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      dotClass = "bg-emerald-500";
      break;

    case "PENDING":
    case "PENDING_APPROVAL":
    case "PENDING_VERIFICATION":
    case "PAYMENT_PENDING":
    case "REPORT_READY":
      label = normalized === "PENDING_APPROVAL" ? "Pending Approval" : normalized === "PENDING_VERIFICATION" ? "Pending Verification" : normalized === "REPORT_READY" ? "Report Ready" : "Pending";
      styleClass = "bg-amber-50 text-amber-700 border-amber-200/80";
      dotClass = "bg-amber-500";
      break;

    case "IN_PROGRESS":
    case "INPROGRESS":
    case "PROCESSING":
    case "SAMPLE_COLLECTED":
    case "COLLECTED":
      label = normalized === "SAMPLE_COLLECTED" || normalized === "COLLECTED" ? "Sample Collected" : "In Progress";
      styleClass = "bg-sky-50 text-sky-700 border-sky-200/80";
      dotClass = "bg-sky-500";
      break;

    case "COMPLETED":
    case "FULFILLED":
      label = "Completed";
      styleClass = "bg-teal-50 text-teal-700 border-teal-200/80";
      dotClass = "bg-teal-600";
      break;

    case "REJECTED":
    case "INACTIVE":
    case "CANCELLED":
    case "FAILED":
      label = normalized === "REJECTED" ? "Rejected" : normalized === "INACTIVE" ? "Inactive" : "Cancelled";
      styleClass = "bg-rose-50 text-rose-700 border-rose-200/80";
      dotClass = "bg-rose-500";
      break;

    default:
      label = status.toString();
      styleClass = "bg-slate-50 text-slate-700 border-slate-200/80";
      dotClass = "bg-slate-400";
      break;
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs", styleClass, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClass)} />
      <span>{label}</span>
    </span>
  );
}
