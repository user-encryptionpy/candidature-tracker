import { ApplicationStatus, STATUS_BADGE_COLORS, STATUS_LABELS } from "@/lib/types";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const colors = STATUS_BADGE_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ring-black/5"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: colors.text }}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}
