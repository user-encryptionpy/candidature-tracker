"use client";

import { useState } from "react";

export function QuickAdd({
  companies,
  onAdded,
}: {
  companies: string[];
  onAdded: () => void;
}) {
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !jobTitle.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          jobTitle: jobTitle.trim(),
          status: "APPLIED",
        }),
      });
      setCompany("");
      setJobTitle("");
      onAdded();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10"
    >
      <span className="flex items-center gap-2 pl-1 text-[11px] font-semibold uppercase tracking-wider text-navy dark:text-blue-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" strokeLinejoin="round" />
        </svg>
        Quick add
      </span>
      <input
        list="quickadd-company-options"
        className="min-w-[150px] flex-1 rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow placeholder:text-gray-400 focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <datalist id="quickadd-company-options">
        {companies.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <input
        className="min-w-[200px] flex-[2] rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow placeholder:text-gray-400 focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10"
        placeholder="Job title — Enter saves as Applied, today"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />
      <button
        type="submit"
        disabled={saving || !company.trim() || !jobTitle.trim()}
        className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light disabled:opacity-40"
      >
        {saving ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
