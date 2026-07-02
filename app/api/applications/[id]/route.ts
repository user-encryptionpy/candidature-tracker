import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id: Number(id) },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(application);
}

// Statuses that count as the company having responded.
const RESPONDED = new Set(["INTERVIEW", "OFFER", "REJECTED"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  for (const key of [
    "company",
    "jobTitle",
    "url",
    "contractType",
    "country",
    "location",
    "status",
    "source",
    "salary",
    "contactPerson",
    "contactEmail",
    "interviewHR",
    "interviewTech",
    "offerReceived",
    "result",
    "notes",
    "rawPastedText",
  ]) {
    if (key in body) data[key] = body[key];
  }
  for (const dateKey of ["dateApplied", "nextFollowUp", "dateResponse"]) {
    if (dateKey in body) {
      data[dateKey] = body[dateKey] ? new Date(body[dateKey]) : null;
    }
  }

  // When the status moves to a "responded" state, stamp the response date with
  // today (the first time it happens) — this drives the response-delay KPI.
  if ("status" in body && !("dateResponse" in body)) {
    const current = await prisma.application.findUnique({
      where: { id: Number(id) },
      select: { status: true, dateResponse: true },
    });
    if (
      current &&
      body.status !== current.status &&
      RESPONDED.has(body.status) &&
      !current.dateResponse
    ) {
      data.dateResponse = new Date();
    }
  }

  const application = await prisma.application.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json(application);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.application.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
