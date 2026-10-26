import { STATUS_LABELS, type EnquiryStatus } from "@/lib/enquiry-schema";

const CLS: Record<EnquiryStatus, string> = {
  new: "bg-teal text-navy-deep",
  in_progress: "bg-warning text-warning-foreground",
  responded: "bg-accent text-accent-foreground",
  closed: "bg-muted text-muted-foreground",
  spam: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLS[status]}`}>{STATUS_LABELS[status]}</span>;
}
