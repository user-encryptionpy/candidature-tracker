"use client";

import { useEffect, useState } from "react";
import { ApplicationStatus, STATUS_LABELS } from "@/lib/types";

const PROMPT: Record<string, string> = {
  INTERVIEW: "When did you get the interview invite?",
  OFFER: "When did you receive the offer?",
  REJECTED: "When did you receive the rejection?",
};

export function ResponseDateModal({
  open,
  status,
  company,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  status: ApplicationStatus | null;
  company: string;
  onConfirm: (dateISO: string) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);

  useEffect(() => {
    if (open) setDate(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !status) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-ink/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-navy-ink">
          Mark as {STATUS_LABELS[status]}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {PROMPT[status] ?? "When did you receive this?"}{" "}
          <span className="font-medium text-gray-700">{company}</span>
        </p>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Response received
        </label>
        <input
          type="date"
          max={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          autoFocus
          className="mt-1 w-full rounded-xl border-0 bg-surface px-3 py-2 text-sm ring-1 ring-inset ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-light"
        />
        <p className="mt-1.5 text-xs text-gray-400">
          Pick today or an earlier date — it sets the response delay.
        </p>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(date || today)}
            className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
