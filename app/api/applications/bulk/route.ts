import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Status } from "@/app/generated/prisma/client";

// Update the status (and response date) of many applications at once — e.g.
// select every "Inetum" row and mark them all Rejected in one go.
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const ids: number[] = Array.isArray(body.ids)
    ? body.ids.map(Number).filter((n: number) => Number.isFinite(n))
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "No applications selected" }, { status: 400 });
  }

  const data: { status?: Status; dateResponse?: Date | null } = {};
  if (body.status) data.status = body.status as Status;
  // The caller passes an explicit response date for replied statuses and null
  // when moving back to Applied / No response.
  if ("dateResponse" in body) {
    data.dateResponse = body.dateResponse ? new Date(body.dateResponse) : null;
  }

  const result = await prisma.application.updateMany({
    where: { id: { in: ids } },
    data,
  });

  return NextResponse.json({ updated: result.count });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const ids: number[] = Array.isArray(body.ids)
    ? body.ids.map(Number).filter((n: number) => Number.isFinite(n))
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "No applications selected" }, { status: 400 });
  }

  const result = await prisma.application.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ deleted: result.count });
}
