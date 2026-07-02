"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseJobText } from "@/lib/parseJobText";

const STATUS_OPTIONS = [
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "NO_RESPONSE", label: "No response" },
];

interface CompanyDetail {
  country: string | null;
  location: string | null;
  source: string | null;
}

function plusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function emptyForm() {
  return {
    company: "",
    jobTitle: "",
    url: "",
    contractType: "",
    country: "",
    location: "",
    dateApplied: new Date().toISOString().slice(0, 10),
    status: "APPLIED",
    source: "",
    salary: "",
    contactPerson: "",
    contactEmail: "",
    nextFollowUp: plusDays(14), // auto follow-up two weeks out
    notes: "",
  };
}

type FormState = ReturnType<typeof emptyForm>;

export default function NewApplicationPage() {
  const router = useRouter();
  const [pastedText, setPastedText] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [companies, setCompanies] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [companyDetails, setCompanyDetails] = useState<
    Record<string, CompanyDetail>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const touched = useRef(new Set<string>());

  function loadCompanies() {
    return fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data.companies ?? []);
        setSources(data.sources ?? []);
        setCompanyDetails(data.companyDetails ?? {});
        // Smart defaults: pre-fill Source/Country with your most common values,
        // but only where empty and not yet edited.
        setForm((f) => {
          const next = { ...f };
          if (!next.source && !touched.current.has("source") && data.defaults?.source)
            next.source = data.defaults.source;
          if (!next.country && !touched.current.has("country") && data.defaults?.country)
            next.country = data.defaults.country;
          return next;
        });
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyCompanyAutofill(company: string, base: FormState): FormState {
    const detail = companyDetails[company];
    if (!detail) return base;
    const next = { ...base };
    if (detail.country && !touched.current.has("country"))
      next.country = detail.country;
    if (detail.location && !touched.current.has("location"))
      next.location = detail.location;
    if (detail.source && !touched.current.has("source"))
      next.source = detail.source;
    return next;
  }

  function handleFieldChange(field: keyof FormState, value: string) {
    touched.current.add(field);
    setForm((f) => {
      let next = { ...f, [field]: value };
      if (field === "company") next = applyCompanyAutofill(value, next);
      return next;
    });
  }

  function handlePasteText(value: string) {
    setPastedText(value);
    const parsed = parseJobText(value, companies);
    setForm((f) => {
      let next = { ...f };
      for (const key of Object.keys(parsed) as (keyof typeof parsed)[]) {
        if (!touched.current.has(key) && parsed[key]) {
          (next as Record<string, string>)[key] = parsed[key] as string;
        }
      }
      if (parsed.company) next = applyCompanyAutofill(parsed.company, next);
      return next;
    });
  }

  async function isDuplicate(company: string, jobTitle: string) {
    try {
      const res = await fetch(
        `/api/applications?q=${encodeURIComponent(company)}`
      );
      const existing = await res.json();
      return existing.some(
        (a: { company: string; jobTitle: string }) =>
          a.company.toLowerCase() === company.toLowerCase() &&
          a.jobTitle.toLowerCase() === jobTitle.toLowerCase()
      );
    } catch {
      return false;
    }
  }

  function resetForNext() {
    setForm(emptyForm());
    setPastedText("");
    touched.current = new Set();
    loadCompanies();
  }

  async function save(addAnother: boolean) {
    if (!form.company || !form.jobTitle) {
      setError("Company and job title are required.");
      return;
    }
    setError(null);

    if (await isDuplicate(form.company, form.jobTitle)) {
      const proceed = confirm(
        `You already have "${form.company} — ${form.jobTitle}" in your tracker. Add it anyway?`
      );
      if (!proceed) return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rawPastedText: pastedText || null }),
      });
      if (!res.ok) throw new Error("Failed to save");
      if (addAnother) {
        setSavedNotice(`Saved "${form.company} — ${form.jobTitle}".`);
        resetForNext();
        setSubmitting(false);
        setTimeout(() => setSavedNotice(null), 4000);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong saving the application.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-navy">New application</h1>

      {savedNotice && (
        <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {savedNotice}
        </p>
      )}

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Paste job posting text (optional)
        </label>
        <textarea
          className="h-40 w-full rounded-md border border-gray-300 p-2 text-sm"
          placeholder="Paste the job title, company, URL, salary, contract type... whatever you copied from the listing. Fields below will be pre-filled — including Source detected from the URL — check them before saving."
          value={pastedText}
          onChange={(e) => handlePasteText(e.target.value)}
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Company *
            </label>
            <input
              list="company-options"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.company}
              onChange={(e) => handleFieldChange("company", e.target.value)}
              required
            />
            <datalist id="company-options">
              {companies.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Job title *
            </label>
            <input
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.jobTitle}
              onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
              required
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Offer URL
            </label>
            <input
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.url}
              onChange={(e) => handleFieldChange("url", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contract type
            </label>
            <input
              list="contract-options"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.contractType}
              onChange={(e) => handleFieldChange("contractType", e.target.value)}
              placeholder="CDI, Stage, PFE, Alternance..."
            />
            <datalist id="contract-options">
              {["CDI", "CDD", "Stage", "PFE", "Alternance", "Freelance"].map(
                (c) => (
                  <option key={c} value={c} />
                )
              )}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Source
            </label>
            <input
              list="source-options"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.source}
              onChange={(e) => handleFieldChange("source", e.target.value)}
              placeholder="LinkedIn, Indeed, referral..."
            />
            <datalist id="source-options">
              {sources.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.country}
              onChange={(e) => handleFieldChange("country", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date applied
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.dateApplied}
              onChange={(e) => handleFieldChange("dateApplied", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.status}
              onChange={(e) => handleFieldChange("status", e.target.value)}
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
              value={form.salary}
              onChange={(e) => handleFieldChange("salary", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Next follow-up
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.nextFollowUp}
              onChange={(e) =>
                handleFieldChange("nextFollowUp", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contact person
            </label>
            <input
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.contactPerson}
              onChange={(e) =>
                handleFieldChange("contactPerson", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contact email
            </label>
            <input
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.contactEmail}
              onChange={(e) =>
                handleFieldChange("contactEmail", e.target.value)
              }
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              className="h-20 w-full rounded-md border border-gray-300 p-2 text-sm"
              value={form.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save application"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => save(true)}
            className="rounded-md border border-navy px-4 py-2 text-sm font-medium text-navy hover:bg-navy hover:text-white disabled:opacity-50"
          >
            Save &amp; add another
          </button>
        </div>
      </form>
    </div>
  );
}
