import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "@/lib/types";
import { STATUS_BADGE_COLORS } from "@/lib/types";

const NAVY = "FF1F3864";
const NAVY_LIGHT = "FF2E75B6";
const STRIPE = "FFEBF3FB";

// French labels chosen so a re-import maps them back to the same status.
const STATUS_FR: Record<ApplicationStatus, string> = {
  APPLIED: "En Attente",
  INTERVIEW: "Entretien",
  OFFER: "Offre Reçue",
  REJECTED: "Refus",
  NO_RESPONSE: "Sans Réponse",
};

const COLUMNS = [
  { header: "N°", width: 5 },
  { header: "Entreprise", width: 22 },
  { header: "Poste", width: 34 },
  { header: "Type Contrat", width: 12 },
  { header: "Pays", width: 12 },
  { header: "Ville", width: 14 },
  { header: "Salaire / TJM", width: 14 },
  { header: "Source", width: 14 },
  { header: "Date Postulation", width: 15 },
  { header: "Date Relance", width: 14 },
  { header: "Statut", width: 16 },
  { header: "Date Réponse", width: 14 },
  { header: "Délai Réponse", width: 13 },
  { header: "Entretien RH", width: 13 },
  { header: "Entretien Tech", width: 13 },
  { header: "Offre Reçue", width: 12 },
  { header: "Résultat", width: 14 },
  { header: "Notes / Action", width: 30 },
];

// Return a real Date (rendered by Excel with a date format) so the exported
// file re-imports cleanly — writing a formatted string would be misparsed.
function asDate(d: Date | null): Date | "" {
  return d ? new Date(d) : "";
}

function delayDays(applied: Date, response: Date | null): number | "" {
  if (!response) return "";
  const days = Math.round(
    (new Date(response).getTime() - new Date(applied).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  return days >= 0 ? days : "";
}

export async function GET() {
  const apps = await prisma.application.findMany({
    orderBy: { dateApplied: "desc" },
  });

  const total = apps.length;
  const counts: Record<ApplicationStatus, number> = {
    APPLIED: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
    NO_RESPONSE: 0,
  };
  for (const a of apps) counts[a.status as ApplicationStatus]++;
  const interview = counts.INTERVIEW + counts.OFFER;
  const responded = counts.INTERVIEW + counts.OFFER + counts.REJECTED;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const delays = apps
    .filter((a) => a.dateResponse)
    .map(
      (a) =>
        (new Date(a.dateResponse!).getTime() -
          new Date(a.dateApplied).getTime()) /
        (24 * 60 * 60 * 1000)
    )
    .filter((d) => d >= 0);
  const avgDelay = delays.length
    ? Math.round(delays.reduce((s, d) => s + d, 0) / delays.length)
    : null;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Mes Candidatures", {
    views: [{ state: "frozen", ySplit: 4 }],
  });
  const lastCol = COLUMNS.length;

  // Row 1 — title
  ws.mergeCells(1, 1, 1, lastCol);
  const title = ws.getCell(1, 1);
  title.value = "SUIVI DE MES CANDIDATURES";
  title.font = { name: "Arial", size: 15, bold: true, color: { argb: "FFFFFFFF" } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  title.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 26;

  // Row 2 — KPI summary
  ws.mergeCells(2, 1, 2, lastCol);
  const kpi = ws.getCell(2, 1);
  kpi.value =
    `Total: ${total}   |   Taux entretien: ${pct(interview)}%   |   ` +
    `Taux offre: ${pct(counts.OFFER)}%   |   Taux de réponse: ${pct(responded)}%   |   ` +
    `Refus: ${counts.REJECTED}   |   Délai de réponse moyen: ${
      avgDelay == null ? "—" : `${avgDelay} j`
    }`;
  kpi.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  kpi.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_LIGHT } };
  kpi.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 20;

  // Row 3 — updated date
  ws.mergeCells(3, 1, 3, lastCol);
  const updated = ws.getCell(3, 1);
  updated.value = `Mis à jour : ${new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;
  updated.font = { name: "Arial", size: 9, italic: true };

  // Row 4 — column headers
  const headerRow = ws.getRow(4);
  COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: NAVY_LIGHT } },
      bottom: { style: "thin", color: { argb: NAVY_LIGHT } },
      left: { style: "thin", color: { argb: NAVY_LIGHT } },
      right: { style: "thin", color: { argb: NAVY_LIGHT } },
    };
    ws.getColumn(i + 1).width = col.width;
  });
  headerRow.height = 28;

  // Data rows
  apps.forEach((a, i) => {
    const status = a.status as ApplicationStatus;
    const row = ws.getRow(5 + i);
    const values = [
      i + 1,
      a.company,
      a.jobTitle,
      a.contractType ?? "",
      a.country ?? "",
      a.location ?? "",
      a.salary ?? "",
      a.source ?? "",
      asDate(a.dateApplied),
      asDate(a.nextFollowUp),
      STATUS_FR[status],
      asDate(a.dateResponse),
      delayDays(a.dateApplied, a.dateResponse),
      a.interviewHR ?? "",
      a.interviewTech ?? "",
      a.offerReceived ?? "",
      a.result ?? "",
      a.notes ?? "",
    ];
    values.forEach((v, c) => {
      const cell = row.getCell(c + 1);
      cell.value = v;
      if (v instanceof Date) cell.numFmt = "dd/mm/yyyy";
      cell.font = { name: "Arial", size: 10 };
      cell.alignment = { vertical: "middle", wrapText: c === 2 || c === 17 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: i % 2 === 1 ? STRIPE : "FFFFFFFF" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD9D9D9" } },
        bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
        left: { style: "thin", color: { argb: "FFD9D9D9" } },
        right: { style: "thin", color: { argb: "FFD9D9D9" } },
      };
    });
    // Colour the Statut cell to match the app / original conditional formatting.
    const statusCell = row.getCell(11);
    const colors = STATUS_BADGE_COLORS[status];
    statusCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF" + colors.bg.replace("#", "") },
    };
    statusCell.font = {
      name: "Arial",
      size: 10,
      bold: true,
      color: { argb: "FF" + colors.text.replace("#", "") },
    };
    statusCell.alignment = { horizontal: "center", vertical: "middle" };
  });

  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: lastCol } };

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `Mes_Candidatures_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
