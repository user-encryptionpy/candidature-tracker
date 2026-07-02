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
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        No applications match. Try clearing the search/filter, or{" "}
        <Link href="/new" className="underline">
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
    <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-navy text-left text-xs font-semibold uppercase tracking-wide text-white">
          <tr>
            <th className="border border-navy-light/40 px-3 py-2">Company</th>
            <th className="border border-navy-light/40 px-3 py-2">Job title</th>
            <th className="border border-navy-light/40 px-3 py-2">Status</th>
            <th className="border border-navy-light/40 px-3 py-2">Source</th>
            <th className="border border-navy-light/40 px-3 py-2">Applied</th>
            <th className="border border-navy-light/40 px-3 py-2">Response</th>
            <th className="border border-navy-light/40 px-3 py-2">
              Next follow-up
            </th>
            <th className="border border-navy-light/40 px-3 py-2 text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((a, i) => {
            const colors = STATUS_BADGE_COLORS[a.status];
            return (
              <tr
                key={a.id}
                className={i % 2 === 1 ? "bg-row-stripe" : "bg-white"}
              >
                <td className="border border-gray-200 px-3 py-2">
                  <Link
                    href={`/applications/${a.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {a.company}
                  </Link>
                </td>
                <td className="border border-gray-200 px-3 py-2 text-gray-700">
                  {a.jobTitle}
                </td>
                <td className="border border-gray-200 px-2 py-1.5">
                  <select
                    value={a.status}
                    onChange={(e) =>
                      onStatusChange(a.id, e.target.value as ApplicationStatus)
                    }
                    className="cursor-pointer rounded border-0 px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
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
                <td className="border border-gray-200 px-3 py-2 text-gray-500">
                  {a.source || "—"}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-gray-500">
                  {new Date(a.dateApplied).toLocaleDateString()}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-gray-500">
                  {a.dateResponse
                    ? new Date(a.dateResponse).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-gray-500">
                  {a.nextFollowUp
                    ? new Date(a.nextFollowUp).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-right">
                  <button
                    onClick={() =>
                      handleDelete(a.id, `${a.company} — ${a.jobTitle}`)
                    }
                    className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
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
