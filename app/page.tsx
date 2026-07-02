"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Application, ApplicationStatus, Profile, Stats } from "@/lib/types";
import { StatCard } from "@/app/components/StatCard";
import {
  StatusBreakdownChart,
  VolumeOverTimeChart,
} from "@/app/components/Charts";
import { ApplicationsTable } from "@/app/components/ApplicationsTable";
import { StatusBadge } from "@/app/components/StatusBadge";
import { QuickAdd } from "@/app/components/QuickAdd";
import { downloadChartPng } from "@/lib/downloadChart";

const STATUS_FILTERS = [
  { value: "ALL", label: "All statuses" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "NO_RESPONSE", label: "No response" },
];

const ICONS = {
  total: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
    </svg>
  ),
  interview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M8 10h8M8 14h5M21 12a9 9 0 1 1-4-7.5L21 4l-.6 3.4A8.96 8.96 0 0 1 21 12z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  offer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 15l-3.5 2 1-4L6 10l4-.3L12 6l2 3.7 4 .3-3.5 3 1 4z" strokeLinejoin="round" />
    </svg>
  ),
  response: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 12h10M14 12l-4-4M14 12l-4 4M20 5v14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" />
    </svg>
  ),
  rejected: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
    </svg>
  ),
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const volumeChartRef = useRef<HTMLDivElement>(null);
  const statusChartRef = useRef<HTMLDivElement>(null);

  const fetchStats = useCallback(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const fetchCompanies = useCallback(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((d) => setCompanies(d.companies ?? []))
      .catch(() => {});
  }, []);

  const fetchApplications = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status !== "ALL") params.set("status", status);
    setLoading(true);
    return fetch(`/api/applications?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query, status]);

  useEffect(() => {
    fetchStats();
    fetchCompanies();
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => {});
  }, [fetchStats, fetchCompanies]);

  useEffect(() => {
    const timeout = setTimeout(fetchApplications, 250);
    return () => clearTimeout(timeout);
  }, [fetchApplications]);

  async function handleDelete(id: number) {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    await Promise.all([fetchApplications(), fetchStats()]);
  }

  async function handleStatusChange(id: number, newStatus: ApplicationStatus) {
    setApplications((apps) =>
      apps.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await Promise.all([fetchApplications(), fetchStats()]);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadMessage(data.error ?? "Import failed.");
      } else {
        setUploadMessage(
          `Imported ${data.imported} new application${
            data.imported === 1 ? "" : "s"
          }${data.skipped ? ` (${data.skipped} already in tracker, skipped)` : ""}.`
        );
        await Promise.all([fetchApplications(), fetchStats(), fetchCompanies()]);
      }
    } catch {
      setUploadMessage("Import failed — check the file and try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const ghostButton =
    "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm ring-1 ring-gray-900/10 transition-colors hover:bg-navy hover:text-white disabled:opacity-50";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-ink">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Your pipeline at a glance —{" "}
            {stats ? `${stats.total} applications tracked` : "loading..."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileSelected}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={ghostButton}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M12 16V4m0 0L7 9m5-5l5 5M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {uploading ? "Importing..." : "Import Excel"}
          </button>
          <a href="/api/export" className={ghostButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M12 4v12m0 0l5-5m-5 5l-5-5M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export Excel
          </a>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            New application
          </Link>
        </div>
      </div>

      {uploadMessage && (
        <p className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-navy ring-1 ring-navy-light/20">
          {uploadMessage}
        </p>
      )}

      {stats && profile && profile.weeklyGoal > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-navy-ink">
              Weekly goal
              {profile.fullName ? ` — keep going, ${profile.fullName.split(" ")[0]}!` : ""}
            </span>
            <span className="font-bold tabular-nums text-navy">
              {stats.thisWeek} / {profile.weeklyGoal}{" "}
              <span className="font-medium text-gray-400">this week</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface ring-1 ring-inset ring-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                stats.thisWeek >= profile.weeklyGoal
                  ? "bg-accent"
                  : "bg-gradient-to-r from-navy to-navy-light"
              }`}
              style={{
                width: `${Math.min(100, (stats.thisWeek / profile.weeklyGoal) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total" value={stats.total} icon={ICONS.total} />
            <StatCard
              label="Interview rate"
              value={`${stats.funnel.interviewRate}%`}
              sub={`${stats.funnel.interview} of ${stats.funnel.applied}`}
              icon={ICONS.interview}
              tone="amber"
            />
            <StatCard
              label="Offer rate"
              value={`${stats.funnel.offerRate}%`}
              sub={`${stats.funnel.offer} of ${stats.funnel.applied}`}
              icon={ICONS.offer}
              tone="green"
            />
            <StatCard
              label="Response rate"
              value={`${stats.funnel.responseRate}%`}
              icon={ICONS.response}
            />
            <StatCard
              label="Avg response"
              value={
                stats.funnel.avgResponseDays == null
                  ? "—"
                  : `${stats.funnel.avgResponseDays} d`
              }
              sub="days to reply"
              icon={ICONS.clock}
              tone="amber"
            />
            <StatCard
              label="Rejected"
              value={stats.funnel.rejected}
              icon={ICONS.rejected}
              tone="red"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[
              {
                title: "Applications per week",
                sub: "last 12 weeks",
                ref: volumeChartRef,
                file: "applications-per-week.png",
                chart: <VolumeOverTimeChart data={stats.volume} />,
              },
              {
                title: "Status breakdown",
                sub: "current pipeline",
                ref: statusChartRef,
                file: "status-breakdown.png",
                chart: <StatusBreakdownChart data={stats.statusBreakdown} />,
              },
            ].map((panel) => (
              <div
                key={panel.file}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-navy-ink">
                      {panel.title}
                    </h2>
                    <p className="text-xs text-gray-400">{panel.sub}</p>
                  </div>
                  <button
                    onClick={() => downloadChartPng(panel.ref.current, panel.file)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-400 ring-1 ring-gray-200 transition-colors hover:bg-surface hover:text-navy"
                    title="Download as PNG"
                  >
                    ↓ PNG
                  </button>
                </div>
                <div ref={panel.ref}>{panel.chart}</div>
              </div>
            ))}
          </div>

          {stats.pendingFollowUps.length > 0 && (
            <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200/60">
              <h2 className="mb-2.5 flex items-center gap-2 text-sm font-bold text-amber-900">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Pending follow-ups ({stats.pendingFollowUps.length})
              </h2>
              <ul className="space-y-1.5">
                {stats.pendingFollowUps.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <Link
                      href={`/applications/${a.id}`}
                      className="font-semibold text-amber-950 hover:underline"
                    >
                      {a.company} — {a.jobTitle}
                    </Link>
                    <StatusBadge status={a.status} />
                    <span className="text-amber-700">
                      due {new Date(a.nextFollowUp!).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <QuickAdd
        companies={companies}
        onAdded={() => {
          fetchApplications();
          fetchStats();
          fetchCompanies();
        }}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              className="w-full rounded-xl border-0 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm ring-1 ring-gray-900/10 transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-light"
              placeholder="Search company, title, location, source..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm font-medium shadow-sm ring-1 ring-gray-900/10 focus:outline-none focus:ring-2 focus:ring-navy-light"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-gray-900/5">
            Loading...
          </p>
        ) : (
          <ApplicationsTable
            applications={applications}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
