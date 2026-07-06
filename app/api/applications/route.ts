import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@/app/generated/prisma/client";
import { cutoffDate, getNoResponseDays } from "@/lib/autoExpire";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Filter by the effective status shown in the graph: "No response" also
  // covers Applied with no reply past the threshold; "Applied" excludes them.
  let statusFilter: Prisma.ApplicationWhereInput = {};
  if (status && status !== "ALL") {
    const cutoff = cutoffDate(await getNoResponseDays());
    if (status === "NO_RESPONSE") {
      statusFilter = {
        OR: [
          { status: "NO_RESPONSE" },
          { status: "APPLIED", dateApplied: { lt: cutoff } },
        ],
      };
    } else if (status === "APPLIED") {
      statusFilter = { status: "APPLIED", dateApplied: { gte: cutoff } };
    } else {
      statusFilter = { status: status as Status };
    }
  }

  const dateFilter: Prisma.ApplicationWhereInput = {};
  if (from || to) {
    const range: Prisma.DateTimeFilter = {};
    if (from) range.gte = new Date(`${from}T00:00:00`);
    if (to) range.lte = new Date(`${to}T23:59:59.999`);
    dateFilter.dateApplied = range;
  }

  const applications = await prisma.application.findMany({
    where: {
      AND: [
        statusFilter,
        dateFilter,
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
