import type { Status } from "@/app/generated/prisma/client";

// The stored status stays the source of truth ("you applied"). For analytics
// and filtering, an application still in APPLIED has not heard back yet, so it
// counts as NO_RESPONSE — used by the status-breakdown graph and the list
// filter, never by the table's own status column.
export function effectiveStatus(status: Status): Status {
  return status === "APPLIED" ? "NO_RESPONSE" : status;
}
