type StatusBadgeProps = {
  status: "pending" | "verified" | "settled" | "flagged" | "failed" | "processing" | "active" | "suspended" | "completed" | "reversed";
};

const statusStyles: Record<string, string> = {
  pending: "bg-[#FFF3E0] text-[#EF6C00]",
  verified: "bg-[#E8F5E9] text-[#2E7D32]",
  settled: "bg-[#E8F5E9] text-[#2E7D32]",
  flagged: "bg-[#FFEBEE] text-[#C62828]",
  failed: "bg-[#FFEBEE] text-[#C62828]",
  processing: "bg-[#FFF8E1] text-[#F57F17]",
  completed: "bg-[#E8F5E9] text-[#2E7D32]",
  reversed: "bg-[#FFF3E0] text-[#EF6C00]",
  active: "bg-green-50 text-green-700",
  suspended: "bg-error-container text-error",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[status] || statusStyles.pending}`}>
      {status}
    </span>
  );
}

export function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
      {children}
    </span>
  );
}
