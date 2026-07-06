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
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-navy-ink dark:text-slate-100">
          {app.company}{" "}
          <span className="font-medium text-gray-400">— {app.jobTitle}</span>
        </h1>
        <button
          onClick={handleDelete}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Company
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Job title
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Offer URL
          </label>
          <div className="flex gap-2">
            <input
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
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
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Location
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.location ?? ""}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Contract type
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.contractType ?? ""}
            onChange={(e) => update("contractType", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Country
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.country ?? ""}
            onChange={(e) => update("country", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Source
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.source ?? ""}
            onChange={(e) => update("source", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Date applied
          </label>
          <input
            type="date"
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={toDateInput(app.dateApplied)}
            onChange={(e) => update("dateApplied", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Status
          </label>
          <select
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
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
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Salary
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.salary ?? ""}
            onChange={(e) => update("salary", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            CV version sent
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.cvVersion ?? ""}
            onChange={(e) => update("cvVersion", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Next follow-up
          </label>
          <input
            type="date"
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={toDateInput(app.nextFollowUp)}
            onChange={(e) => update("nextFollowUp", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Response date
          </label>
          <input
            type="date"
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={toDateInput(app.dateResponse)}
            onChange={(e) => update("dateResponse", e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">
            Auto-set when you change the status to a responded state.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Interview HR
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.interviewHR ?? ""}
            onChange={(e) => update("interviewHR", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Interview Tech
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.interviewTech ?? ""}
            onChange={(e) => update("interviewTech", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Offer received
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.offerReceived ?? ""}
            onChange={(e) => update("offerReceived", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Result
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.result ?? ""}
            onChange={(e) => update("result", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Contact person
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.contactPerson ?? ""}
            onChange={(e) => update("contactPerson", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Contact email
          </label>
          <input
            className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
            value={app.contactEmail ?? ""}
            onChange={(e) => update("contactEmail", e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
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
        className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
