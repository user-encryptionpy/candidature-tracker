import { prisma } from "@/lib/prisma";
import type { Status } from "@/app/generated/prisma/client";

export async function getNoResponseDays(): Promise<number> {
  const p = await prisma.profile.findUnique({
    where: { id: 1 },
    select: { noResponseDays: true },
  });
  return p?.noResponseDays ?? 7;
}

export function cutoffDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

// The stored status stays the source of truth ("you applied"). For analytics
// only, an application still in APPLIED with no reply past the threshold is
// treated as NO_RESPONSE — used by the status-breakdown graph, not the table.
export function effectiveStatus(
  status: Status,
  dateApplied: Date | string,
  cutoff: Date
): Status {
  if (status === "APPLIED" && new Date(dateApplied) < cutoff) {
    return "NO_RESPONSE";
  }
  return status;
}
