import { ApplicationStatus, STATUS_BADGE_COLORS, STATUS_LABELS } from "@/lib/types";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const colors = STATUS_BADGE_COLORS[status];
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
