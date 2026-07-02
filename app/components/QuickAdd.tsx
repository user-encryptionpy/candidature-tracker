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
      className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-navy/40 bg-blue-50/40 p-3"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-navy">
        Quick add
      </span>
      <input
        list="quickadd-company-options"
        className="min-w-[160px] flex-1 rounded-md border border-gray-300 p-2 text-sm focus:border-navy focus:outline-none"
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
        className="min-w-[200px] flex-[2] rounded-md border border-gray-300 p-2 text-sm focus:border-navy focus:outline-none"
        placeholder="Job title  (press Enter to add as Applied, today)"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />
      <button
        type="submit"
        disabled={saving || !company.trim() || !jobTitle.trim()}
        className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-40"
      >
        {saving ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
