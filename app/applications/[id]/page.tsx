"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Application } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "NO_RESPONSE", label: "No response" },
];

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((r) => r.json())
      .then(setApp);
  }, [id]);

  function update<K extends keyof Application>(field: K, value: Application[K]) {
    setApp((a) => (a ? { ...a, [field]: value } : a));
  }

  async function handleSave() {
    if (!app) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      });
      if (!res.ok) throw new Error();
      router.push("/");
      router.refresh();
    } catch {
      setError("Failed to save changes.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (!app) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy">
          {app.company} — {app.jobTitle}
        </h1>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Job title
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Offer URL
          </label>
          <div className="flex gap-2">
            <input
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={app.url ?? ""}
              onChange={(e) => update("url", e.target.value)}
            />
            {app.url && (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Open
              </a>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.location ?? ""}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contract type
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.contractType ?? ""}
            onChange={(e) => update("contractType", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.country ?? ""}
            onChange={(e) => update("country", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Source
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.source ?? ""}
            onChange={(e) => update("source", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Date applied
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={toDateInput(app.dateApplied)}
            onChange={(e) => update("dateApplied", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.status}
            onChange={(e) =>
              update("status", e.target.value as Application["status"])
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Salary
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.salary ?? ""}
            onChange={(e) => update("salary", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Next follow-up
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={toDateInput(app.nextFollowUp)}
            onChange={(e) => update("nextFollowUp", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Response date
          </label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={toDateInput(app.dateResponse)}
            onChange={(e) => update("dateResponse", e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">
            Auto-set when you change the status to a responded state.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Interview HR
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.interviewHR ?? ""}
            onChange={(e) => update("interviewHR", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Interview Tech
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.interviewTech ?? ""}
            onChange={(e) => update("interviewTech", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Offer received
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.offerReceived ?? ""}
            onChange={(e) => update("offerReceived", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Result
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.result ?? ""}
            onChange={(e) => update("result", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contact person
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.contactPerson ?? ""}
            onChange={(e) => update("contactPerson", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contact email
          </label>
          <input
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.contactEmail ?? ""}
            onChange={(e) => update("contactEmail", e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            className="h-24 w-full rounded-md border border-gray-300 p-2 text-sm"
            value={app.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>

        {app.rawPastedText && (
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Originally pasted text
            </label>
            <textarea
              readOnly
              className="h-24 w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-500"
              value={app.rawPastedText}
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
