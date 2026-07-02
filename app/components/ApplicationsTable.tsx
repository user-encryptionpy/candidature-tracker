import Link from "next/link";
import {
  Application,
  ApplicationStatus,
  STATUS_BADGE_COLORS,
  STATUS_LABELS,
} from "@/lib/types";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "NO_RESPONSE",
];

export function ApplicationsTable({
  applications,
  onDelete,
  onStatusChange,
}: {
  applications: Application[];
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: ApplicationStatus) => void;
}) {
  if (applications.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        No applications match. Try clearing the search/filter, or{" "}
        <Link href="/new" className="font-medium text-navy underline">
          add one
        </Link>
        .
      </p>
    );
  }

  function handleDelete(id: number, label: string) {
    if (confirm(`Remove "${label}" from your tracker? This cannot be undone.`)) {
      onDelete(id);
    }
  }

  return (
    <div className="slim-scroll max-h-[560px] overflow-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-navy text-left text-[11px] font-semibold uppercase tracking-wider text-blue-100">
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Job title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Applied</th>
            <th className="px-4 py-3">Response</th>
            <th className="px-4 py-3">Follow-up</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((a, i) => {
            const colors = STATUS_BADGE_COLORS[a.status];
            return (
              <tr
                key={a.id}
                className={`transition-colors hover:bg-blue-50/60 ${
                  i % 2 === 1 ? "bg-row-stripe" : "bg-white"
                }`}
              >
                <td className="px-4 py-2.5">
                  <Link
                    href={`/applications/${a.id}`}
                    className="font-semibold text-navy-ink hover:text-navy-light hover:underline"
                  >
                    {a.company}
                  </Link>
                </td>
                <td className="max-w-[280px] truncate px-4 py-2.5 text-gray-600" title={a.jobTitle}>
                  {a.jobTitle}
                </td>
                <td className="px-3 py-2">
                  <select
                    value={a.status}
                    onChange={(e) =>
                      onStatusChange(a.id, e.target.value as ApplicationStatus)
                    }
                    className="cursor-pointer appearance-none rounded-full border-0 py-1 pl-3 pr-6 text-xs font-semibold ring-1 ring-inset ring-black/5 transition-shadow focus:outline-none focus:ring-2 focus:ring-navy-light"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5l3 3 3-3' stroke='${encodeURIComponent(
                        colors.text
                      )}' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 6px center",
                      backgroundSize: "12px",
                    }}
                    title="Change status"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option
                        key={s}
                        value={s}
                        style={{ backgroundColor: "white", color: "#111" }}
                      >
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2.5 text-gray-500">{a.source || "—"}</td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-gray-500">
                  {new Date(a.dateApplied).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-gray-500">
                  {a.dateResponse
                    ? new Date(a.dateResponse).toLocaleDateString()
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-gray-500">
                  {a.nextFollowUp
                    ? new Date(a.nextFollowUp).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() =>
                      handleDelete(a.id, `${a.company} — ${a.jobTitle}`)
                    }
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
