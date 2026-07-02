"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Application, ApplicationStatus, Stats } from "@/lib/types";
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
  { value: "ALL", label: "All" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "NO_RESPONSE", label: "No response" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
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
    // Optimistic update so the dropdown reacts instantly.
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
        await Promise.all([fetchApplications(), fetchStats()]);
      }
    } catch {
      setUploadMessage("Import failed — check the file and try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3">
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
            className="rounded-md border border-navy px-4 py-2 text-sm font-medium text-navy hover:bg-navy hover:text-white disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import Excel"}
          </button>
          <a
            href="/api/export"
            className="rounded-md border border-navy px-4 py-2 text-sm font-medium text-navy hover:bg-navy hover:text-white"
          >
            Export Excel
          </a>
          <Link
            href="/new"
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light"
          >
            + New application
          </Link>
        </div>
      </div>

      {uploadMessage && (
        <p className="rounded-md border border-navy-light/30 bg-blue-50 px-3 py-2 text-sm text-navy">
          {uploadMessage}
        </p>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total" value={stats.total} />
            <StatCard
              label="Interview rate"
              value={`${stats.funnel.interviewRate}%`}
              sub={`${stats.funnel.interview} of ${stats.funnel.applied}`}
            />
            <StatCard
              label="Offer rate"
              value={`${stats.funnel.offerRate}%`}
              sub={`${stats.funnel.offer} of ${stats.funnel.applied}`}
            />
            <StatCard
              label="Response rate"
              value={`${stats.funnel.responseRate}%`}
            />
            <StatCard
              label="Avg response"
              value={
                stats.funnel.avgResponseDays == null
                  ? "—"
                  : `${stats.funnel.avgResponseDays} d`
              }
              sub="days to reply"
            />
            <StatCard label="Rejected" value={stats.funnel.rejected} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-navy">
                  Applications per week (last 12 weeks)
                </h2>
                <button
                  onClick={() =>
                    downloadChartPng(
                      volumeChartRef.current,
                      "applications-per-week.png"
                    )
                  }
                  className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  ↓ PNG
                </button>
              </div>
              <div ref={volumeChartRef}>
                <VolumeOverTimeChart data={stats.volume} />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-navy">
                  Status breakdown
                </h2>
                <button
                  onClick={() =>
                    downloadChartPng(
                      statusChartRef.current,
                      "status-breakdown.png"
                    )
                  }
                  className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  ↓ PNG
                </button>
              </div>
              <div ref={statusChartRef}>
                <StatusBreakdownChart data={stats.statusBreakdown} />
              </div>
            </div>
          </div>

          {stats.pendingFollowUps.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h2 className="mb-2 text-sm font-medium text-amber-800">
                Pending follow-ups ({stats.pendingFollowUps.length})
              </h2>
              <ul className="space-y-1">
                {stats.pendingFollowUps.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm">
                    <Link
                      href={`/applications/${a.id}`}
                      className="font-medium hover:underline"
                    >
                      {a.company} — {a.jobTitle}
                    </Link>
                    <StatusBadge status={a.status} />
                    <span className="text-amber-700">
                      follow-up was due{" "}
                      {new Date(a.nextFollowUp!).toLocaleDateString()}
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
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="min-w-[200px] flex-1 rounded-md border border-gray-300 p-2 text-sm focus:border-navy focus:outline-none"
            placeholder="Search company, title, location, source..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="rounded-md border border-gray-300 p-2 text-sm focus:border-navy focus:outline-none"
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
          <p className="text-sm text-gray-500">Loading...</p>
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
