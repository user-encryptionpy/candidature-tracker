import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CompanyDetail {
  country: string | null;
  location: string | null;
  source: string | null;
}

function mode(values: (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

export async function GET() {
  // Most recent first, so the first time we see a company its newest values win.
  const all = await prisma.application.findMany({
    select: {
      company: true,
      source: true,
      country: true,
      location: true,
    },
    orderBy: { dateApplied: "desc" },
  });

  const companyDetails: Record<string, CompanyDetail> = {};
  for (const r of all) {
    if (!companyDetails[r.company]) {
      companyDetails[r.company] = {
        country: r.country,
        location: r.location,
        source: r.source,
      };
    }
  }

  const companies = Object.keys(companyDetails).sort();
  const sources = Array.from(
    new Set(all.map((r) => r.source).filter((s): s is string => !!s))
  ).sort();

  const defaults = {
    source: mode(all.map((r) => r.source)),
    country: mode(all.map((r) => r.country)),
  };

  return NextResponse.json({ companies, sources, companyDetails, defaults });
}
