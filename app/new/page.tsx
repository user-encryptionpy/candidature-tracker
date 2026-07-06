"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseJobText, PASTE_TEMPLATE } from "@/lib/parseJobText";
import { ALL_CITIES, ALL_COUNTRIES, findCountryForCity } from "@/lib/geo";

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
    cvVersion: "",
    contractType: "",
    country: "",
    location: "",
    dateApplied: new Date().toISOString().slice(0, 10),
    status: "APPLIED",
    source: "",
    salary: "",
    contactPerson: "",
    contactEmail: "",
    nextFollowUp: plusDays(14), // overridden by the profile's follow-up interval
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
  const [cvVersions, setCvVersions] = useState<string[]>([]);
  const touched = useRef(new Set<string>());

  useEffect(() => {
    // Profile defaults win over history-derived ones; both only fill
    // fields the user hasn't typed in.
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        setCvVersions(p.cvVersions ?? []);
        setForm((f) => {
          const next = { ...f };
          if (p.defaultSource && !touched.current.has("source"))
            next.source = p.defaultSource;
          if (p.defaultCountry && !touched.current.has("country"))
            next.country = p.defaultCountry;
          if (p.defaultCity && !touched.current.has("location") && !next.location)
            next.location = p.defaultCity;
          if (p.followUpDays && !touched.current.has("nextFollowUp"))
            next.nextFollowUp = plusDays(p.followUpDays);
          if (p.cvVersions?.length === 1 && !next.cvVersion)
            next.cvVersion = p.cvVersions[0];
          return next;
        });
      })
      .catch(() => {});
  }, []);

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
      // Typing a known city fills the country (unless the user set it manually).
      if (field === "location" && !touched.current.has("country")) {
        const country = findCountryForCity(value);
        if (country) next.country = country;
      }
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

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(PASTE_TEMPLATE);
      setSavedNotice("Template copied — fill it anywhere, paste it back here.");
      setTimeout(() => setSavedNotice(null), 4000);
    } catch {
      /* clipboard unavailable — template is still visible in the placeholder */
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-ink dark:text-slate-100">
          New application
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Paste a job posting, a LinkedIn confirmation email, or the standard
          template — the form fills itself.
        </p>
      </div>

      {savedNotice && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          {savedNotice}
        </p>
      )}

      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold text-navy-ink dark:text-slate-100">
            Smart paste
          </label>
          <button
            type="button"
            onClick={copyTemplate}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-400 ring-1 ring-gray-200 transition-colors hover:bg-surface hover:text-navy"
            title="Copy the standard fill-in template to your clipboard"
          >
            Copy template
          </button>
        </div>
        <textarea
          className="h-36 w-full rounded-xl border-0 bg-surface p-3 text-sm ring-1 ring-inset ring-gray-200 transition-shadow placeholder:text-gray-400 focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10"
          placeholder={`Paste anything — or use the standard template:\n\n${PASTE_TEMPLATE.split("\n").slice(0, 6).join("\n")}\n...`}
          value={pastedText}
          onChange={(e) => handlePasteText(e.target.value)}
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
        className="space-y-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Company *
            </label>
            <input
              list="company-options"
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Job title *
            </label>
            <input
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.jobTitle}
              onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
              required
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Offer URL
            </label>
            <input
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.url}
              onChange={(e) => handleFieldChange("url", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Contract type
            </label>
            <input
              list="contract-options"
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Source
            </label>
            <input
              list="source-options"
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Country
            </label>
            <input
              list="country-options"
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.country}
              onChange={(e) => handleFieldChange("country", e.target.value)}
            />
            <datalist id="country-options">
              {ALL_COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              City
            </label>
            <input
              list="city-options"
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              placeholder="Known city fills the country"
            />
            <datalist id="city-options">
              {ALL_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Date applied
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.dateApplied}
              onChange={(e) => handleFieldChange("dateApplied", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Status
            </label>
            <select
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Salary
            </label>
            <input
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.salary}
              onChange={(e) => handleFieldChange("salary", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Next follow-up
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.nextFollowUp}
              onChange={(e) =>
                handleFieldChange("nextFollowUp", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              CV version sent
            </label>
            <input
              list="cv-options"
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.cvVersion}
              onChange={(e) => handleFieldChange("cvVersion", e.target.value)}
              placeholder={
                cvVersions.length
                  ? "Pick a registered CV"
                  : "Register CVs in Profile"
              }
            />
            <datalist id="cv-options">
              {cvVersions.map((cv) => (
                <option key={cv} value={cv} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Contact person
            </label>
            <input
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.contactPerson}
              onChange={(e) =>
                handleFieldChange("contactPerson", e.target.value)
              }
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Contact email
            </label>
            <input
              className="w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-card focus:outline-none focus:ring-2 focus:ring-navy-light dark:text-slate-200 dark:ring-white/10 dark:[color-scheme:dark]"
              value={form.contactEmail}
              onChange={(e) =>
                handleFieldChange("contactEmail", e.target.value)
              }
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
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

        <div className="flex gap-2.5 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save application"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => save(true)}
            className="rounded-xl bg-card px-5 py-2.5 text-sm font-semibold text-navy shadow-sm ring-1 ring-gray-900/10 transition-colors hover:bg-navy hover:text-white disabled:opacity-50 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-navy-light"
          >
            Save &amp; add another
          </button>
        </div>
      </form>
    </div>
  );
}
