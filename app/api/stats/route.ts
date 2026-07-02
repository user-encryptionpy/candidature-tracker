import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday as start of week
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET() {
  const all = await prisma.application.findMany({
    select: { status: true, dateApplied: true, dateResponse: true },
  });

  const total = all.length;
  const counts = { APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0, NO_RESPONSE: 0 };
  for (const a of all) counts[a.status]++;

  const statusBreakdown = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
  }));

  const reachedInterview = counts.INTERVIEW + counts.OFFER;
  const reachedOffer = counts.OFFER;
  const responded = counts.INTERVIEW + counts.OFFER + counts.REJECTED;

  // Average days between applying and the first recorded response.
  const delays = all
    .filter((a) => a.dateResponse)
    .map(
      (a) =>
        (new Date(a.dateResponse!).getTime() -
          new Date(a.dateApplied).getTime()) /
        (24 * 60 * 60 * 1000)
    )
    .filter((d) => d >= 0);
  const avgResponseDays = delays.length
    ? Math.round(delays.reduce((s, d) => s + d, 0) / delays.length)
    : null;

  const funnel = {
    applied: total,
    interview: reachedInterview,
    offer: reachedOffer,
    rejected: counts.REJECTED,
    interviewRate: total ? Math.round((reachedInterview / total) * 100) : 0,
    offerRate: total ? Math.round((reachedOffer / total) * 100) : 0,
    responseRate: total ? Math.round((responded / total) * 100) : 0,
    avgResponseDays,
  };

  const weekBuckets = new Map<string, number>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const w = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    weekBuckets.set(w.toISOString().slice(0, 10), 0);
  }
  for (const a of all) {
    const w = startOfWeek(new Date(a.dateApplied)).toISOString().slice(0, 10);
    if (weekBuckets.has(w)) weekBuckets.set(w, (weekBuckets.get(w) ?? 0) + 1);
  }
  const volume = Array.from(weekBuckets, ([week, count]) => ({ week, count }));

  const pendingFollowUps = await prisma.application.findMany({
    where: {
      nextFollowUp: { lte: now },
      status: { in: ["APPLIED", "INTERVIEW"] },
    },
    orderBy: { nextFollowUp: "asc" },
  });

  return NextResponse.json({ total, statusBreakdown, funnel, volume, pendingFollowUps });
}
