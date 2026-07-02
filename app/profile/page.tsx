"use client";

import { useEffect, useState } from "react";
import { ALL_CITIES, ALL_COUNTRIES } from "@/lib/geo";

const INPUT_CLASS =
  "w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 transition-shadow focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-light";

interface ProfileState {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  defaultCountry: string;
  defaultCity: string;
  defaultSource: string;
  followUpDays: number;
  weeklyGoal: number;
  cvVersions: string[];
}

const EMPTY: ProfileState = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  linkedin: "",
  portfolio: "",
  defaultCountry: "",
  defaultCity: "",
  defaultSource: "",
  followUpDays: 14,
  weeklyGoal: 10,
  cvVersions: [],
};

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>(EMPTY);
  const [newCv, setNewCv] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) =>
        setProfile({
          ...EMPTY,
          ...Object.fromEntries(
            Object.entries(p).map(([k, v]) => [k, v ?? ""])
          ),
          followUpDays: p.followUpDays ?? 14,
          weeklyGoal: p.weeklyGoal ?? 10,
          cvVersions: p.cvVersions ?? [],
        })
      )
      .catch(() => {});
  }, []);

  function set<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function addCv() {
    const name = newCv.trim();
    if (!name || profile.cvVersions.includes(name)) return;
    set("cvVersions", [...profile.cvVersions, name]);
    setNewCv("");
  }

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error();
      setNotice("Profile saved — new applications will use these defaults.");
      setTimeout(() => setNotice(null), 4000);
    } catch {
      setNotice("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-ink">
          Profile
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Your identity, defaults and goals — they pre-fill every new
          application.
        </p>
      </div>

      {notice && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          {notice}
        </p>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
        <h2 className="mb-4 text-sm font-bold text-navy-ink">Identity</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name">
            <input
              className={INPUT_CLASS}
              value={profile.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
          </Field>
          <Field label="Headline">
            <input
              className={INPUT_CLASS}
              placeholder="Ingénieur Industriel — PFE 2026"
              value={profile.headline}
              onChange={(e) => set("headline", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              className={INPUT_CLASS}
              value={profile.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className={INPUT_CLASS}
              value={profile.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="LinkedIn">
            <input
              className={INPUT_CLASS}
              value={profile.linkedin}
              onChange={(e) => set("linkedin", e.target.value)}
            />
          </Field>
          <Field label="Portfolio / GitHub">
            <input
              className={INPUT_CLASS}
              value={profile.portfolio}
              onChange={(e) => set("portfolio", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
        <h2 className="mb-4 text-sm font-bold text-navy-ink">
          Defaults for new applications
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Default country">
            <input
              list="profile-country-options"
              className={INPUT_CLASS}
              value={profile.defaultCountry}
              onChange={(e) => set("defaultCountry", e.target.value)}
            />
            <datalist id="profile-country-options">
              {ALL_COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Default city">
            <input
              list="profile-city-options"
              className={INPUT_CLASS}
              value={profile.defaultCity}
              onChange={(e) => set("defaultCity", e.target.value)}
            />
            <datalist id="profile-city-options">
              {ALL_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Default source">
            <input
              className={INPUT_CLASS}
              placeholder="LinkedIn"
              value={profile.defaultSource}
              onChange={(e) => set("defaultSource", e.target.value)}
            />
          </Field>
          <Field label="Follow-up after (days)">
            <input
              type="number"
              min={1}
              className={INPUT_CLASS}
              value={profile.followUpDays}
              onChange={(e) => set("followUpDays", +e.target.value)}
            />
          </Field>
          <Field label="Weekly application goal">
            <input
              type="number"
              min={0}
              className={INPUT_CLASS}
              value={profile.weeklyGoal}
              onChange={(e) => set("weeklyGoal", +e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
        <h2 className="mb-1 text-sm font-bold text-navy-ink">CV versions</h2>
        <p className="mb-4 text-xs text-gray-400">
          Register the CV variants you send (e.g. &quot;CV Supply Chain FR
          v3&quot;) — then tag each application with the version used.
        </p>
        <div className="mb-3 flex gap-2">
          <input
            className={INPUT_CLASS}
            placeholder="CV name — e.g. CV Data EN v2"
            value={newCv}
            onChange={(e) => setNewCv(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCv();
              }
            }}
          />
          <button
            type="button"
            onClick={addCv}
            className="shrink-0 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            Add
          </button>
        </div>
        {profile.cvVersions.length === 0 ? (
          <p className="text-sm text-gray-400">No CV versions yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {profile.cvVersions.map((cv) => (
              <li
                key={cv}
                className="flex items-center gap-2 rounded-full bg-blue-50 py-1 pl-3 pr-1.5 text-sm font-medium text-navy ring-1 ring-navy-light/20"
              >
                {cv}
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "cvVersions",
                      profile.cvVersions.filter((v) => v !== cv)
                    )
                  }
                  className="flex h-5 w-5 items-center justify-center rounded-full text-navy/50 transition-colors hover:bg-red-100 hover:text-red-600"
                  title={`Remove ${cv}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save profile"}
      </button>
    </div>
  );
}
