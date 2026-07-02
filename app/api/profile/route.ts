import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(profile: {
  cvList: string | null;
  [key: string]: unknown;
}) {
  let cvVersions: string[] = [];
  try {
    cvVersions = profile.cvList ? JSON.parse(profile.cvList) : [];
  } catch {
    cvVersions = [];
  }
  const { cvList: _cvList, ...rest } = profile;
  return { ...rest, cvVersions };
}

export async function GET() {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!profile) {
    return NextResponse.json(
      serialize({
        id: 1,
        fullName: null,
        headline: null,
        email: null,
        phone: null,
        linkedin: null,
        portfolio: null,
        defaultCountry: null,
        defaultCity: null,
        defaultSource: null,
        followUpDays: 14,
        weeklyGoal: 10,
        cvList: null,
      })
    );
  }
  return NextResponse.json(serialize(profile));
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const data = {
    fullName: body.fullName || null,
    headline: body.headline || null,
    email: body.email || null,
    phone: body.phone || null,
    linkedin: body.linkedin || null,
    portfolio: body.portfolio || null,
    defaultCountry: body.defaultCountry || null,
    defaultCity: body.defaultCity || null,
    defaultSource: body.defaultSource || null,
    followUpDays: Number.isFinite(+body.followUpDays)
      ? Math.max(1, Math.round(+body.followUpDays))
      : 14,
    weeklyGoal: Number.isFinite(+body.weeklyGoal)
      ? Math.max(0, Math.round(+body.weeklyGoal))
      : 10,
    cvList: Array.isArray(body.cvVersions)
      ? JSON.stringify(body.cvVersions.filter((v: unknown) => typeof v === "string" && v))
      : null,
  };

  const profile = await prisma.profile.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });

  return NextResponse.json(serialize(profile));
}
