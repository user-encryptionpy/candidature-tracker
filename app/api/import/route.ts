import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseExcelBuffer } from "@/lib/excelImport";

function dedupeKey(company: string, jobTitle: string, dateApplied: Date) {
  return `${company.toLowerCase()}|${jobTitle.toLowerCase()}|${dateApplied
    .toISOString()
    .slice(0, 10)}`;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { applications, fieldMapping } = parseExcelBuffer(buffer);

  if (applications.length === 0) {
    return NextResponse.json(
      { error: "No recognizable rows found in this file." },
      { status: 400 }
    );
  }

  const existing = await prisma.application.findMany({
    select: { company: true, jobTitle: true, dateApplied: true },
  });
  const existingKeys = new Set(
    existing.map((e) => dedupeKey(e.company, e.jobTitle, e.dateApplied))
  );

  let imported = 0;
  let skipped = 0;
  for (const app of applications) {
    const key = dedupeKey(app.company, app.jobTitle, app.dateApplied);
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }
    await prisma.application.create({ data: app });
    existingKeys.add(key);
    imported++;
  }

  return NextResponse.json({
    imported,
    skipped,
    total: applications.length,
    fieldMapping,
  });
}
