import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyAutoNoResponse } from "@/lib/autoExpire";
import { Status } from "@/app/generated/prisma/client";

export async function GET(req: NextRequest) {
  await applyAutoNoResponse();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  const applications = await prisma.application.findMany({
    where: {
      AND: [
        status && status !== "ALL" ? { status: status as Status } : {},
        q
          ? {
              OR: [
                { company: { contains: q } },
                { jobTitle: { contains: q } },
                { location: { contains: q } },
                { source: { contains: q } },
              ],
            }
          : {},
      ],
    },
    orderBy: { dateApplied: "desc" },
  });

  return NextResponse.json(applications);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.company || !body.jobTitle) {
    return NextResponse.json(
      { error: "company and jobTitle are required" },
      { status: 400 }
    );
  }

  const application = await prisma.application.create({
    data: {
      company: body.company,
      jobTitle: body.jobTitle,
      url: body.url || null,
      cvVersion: body.cvVersion || null,
      contractType: body.contractType || null,
      country: body.country || null,
      location: body.location || null,
      dateApplied: body.dateApplied ? new Date(body.dateApplied) : new Date(),
      status: body.status || "APPLIED",
      source: body.source || null,
      salary: body.salary || null,
      contactPerson: body.contactPerson || null,
      contactEmail: body.contactEmail || null,
      nextFollowUp: body.nextFollowUp ? new Date(body.nextFollowUp) : null,
      dateResponse: body.dateResponse ? new Date(body.dateResponse) : null,
      interviewHR: body.interviewHR || null,
      interviewTech: body.interviewTech || null,
      offerReceived: body.offerReceived || null,
      result: body.result || null,
      notes: body.notes || null,
      rawPastedText: body.rawPastedText || null,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
