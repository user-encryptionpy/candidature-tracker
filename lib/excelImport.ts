import * as XLSX from "xlsx";
import type { Status } from "@/app/generated/prisma/client";

// Matches the "Mes Candidatures" sheet template: N°, Entreprise, Poste,
// Type Contrat, Pays, Ville, Salaire / TJM, Source, Date Postulation, Date Relance,
// Statut, Date Réponse, Délai Réponse, Entretien RH, Entretien Tech, Offre Reçue,
// Résultat, Notes / Action. Adjust aliases here if a column isn't picked up.
const HEADER_ALIASES: Record<string, string[]> = {
  company: ["entreprise", "societe", "company"],
  jobTitle: ["poste", "intitule", "job title", "titre"],
  contractType: ["type contrat", "contrat"],
  country: ["pays"],
  location: ["ville"],
  salary: ["salaire", "tjm", "salary"],
  source: ["source", "plateforme"],
  dateApplied: ["date postulation", "date candidature", "date d'envoi"],
  nextFollowUp: ["date relance", "relance", "follow up"],
  status: ["statut", "status", "etat"],
  dateResponse: ["date reponse"],
  interviewHR: ["entretien rh"],
  interviewTech: ["entretien tech"],
  offerReceived: ["offre recue", "offre reçue"],
  result: ["resultat"],
  notes: ["notes / action", "notes", "commentaire", "remarques"],
};

const ALL_ALIAS_WORDS = Object.values(HEADER_ALIASES).flat();

export interface ParsedApplication {
  company: string;
  jobTitle: string;
  contractType: string | null;
  country: string | null;
  location: string | null;
  dateApplied: Date;
  status: Status;
  source: string | null;
  salary: string | null;
  nextFollowUp: Date | null;
  dateResponse: Date | null;
  interviewHR: string | null;
  interviewTech: string | null;
  offerReceived: string | null;
  result: string | null;
  notes: string | null;
}

export interface ParseResult {
  applications: ParsedApplication[];
  headers: string[];
  fieldMapping: Record<string, string>;
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function mapStatus(raw: string | undefined): Status {
  const v = normalize(raw ?? "");
  if (v.includes("entretien") || v.includes("interview")) return "INTERVIEW";
  if (
    v.includes("offre") ||
    v.includes("offer") ||
    v.includes("accept") ||
    v.includes("positive") ||
    v.includes("positif")
  )
    return "OFFER";
  if (v.includes("refus") || v.includes("reject")) return "REJECTED";
  if (
    v.includes("envoy") ||
    v.includes("appli") ||
    v.includes("candidat") ||
    v.includes("attente") ||
    v.includes("cours")
  )
    return "APPLIED";
  return "NO_RESPONSE";
}

function parseDate(raw: unknown): Date | null {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date) return raw;
  if (typeof raw === "number") {
    return new Date(Math.round((raw - 25569) * 86400 * 1000));
  }
  const d = new Date(String(raw));
  return isNaN(d.getTime()) ? null : d;
}

function cell(row: Record<string, unknown>, header: string | undefined) {
  if (!header) return "";
  return String(row[header] ?? "").trim();
}

// The real sheet has a title/subtitle above the header row, so the header
// isn't always row 1 — scan for the row that looks most like our headers.
function findHeaderRowIndex(raw: unknown[][]): number {
  let bestIndex = 0;
  let bestScore = 0;
  for (let i = 0; i < Math.min(raw.length, 20); i++) {
    const row = raw[i];
    if (!row) continue;
    const score = row.filter(
      (c) =>
        typeof c === "string" &&
        ALL_ALIAS_WORDS.some((a) => normalize(c).includes(normalize(a)))
    ).length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  return bestScore >= 2 ? bestIndex : 0;
}

export function parseExcelBuffer(buffer: Buffer | ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  const headerRowIndex = findHeaderRowIndex(raw);
  const headers = (raw[headerRowIndex] ?? []).map((h) => String(h ?? "").trim());

  const rows: Record<string, unknown>[] = raw
    .slice(headerRowIndex + 1)
    .map((r) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => {
        if (h) obj[h] = r[i] ?? "";
      });
      return obj;
    })
    .filter((r) => Object.values(r).some((v) => v !== "" && v != null));

  const fieldMapping: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const match = headers.find(
      (h) => h && aliases.some((a) => normalize(h).includes(normalize(a)))
    );
    if (match) fieldMapping[field] = match;
  }

  const applications: ParsedApplication[] = [];
  for (const row of rows) {
    const company = cell(row, fieldMapping.company);
    const jobTitle = cell(row, fieldMapping.jobTitle);
    if (!company && !jobTitle) continue;

    applications.push({
      company: company || "Unknown",
      jobTitle: jobTitle || "Unknown",
      contractType: cell(row, fieldMapping.contractType) || null,
      country: cell(row, fieldMapping.country) || null,
      location: cell(row, fieldMapping.location) || null,
      dateApplied: parseDate(row[fieldMapping.dateApplied]) || new Date(),
      status: mapStatus(cell(row, fieldMapping.status)),
      source: cell(row, fieldMapping.source) || null,
      salary: cell(row, fieldMapping.salary) || null,
      nextFollowUp: parseDate(row[fieldMapping.nextFollowUp]),
      dateResponse: parseDate(row[fieldMapping.dateResponse]),
      interviewHR: cell(row, fieldMapping.interviewHR) || null,
      interviewTech: cell(row, fieldMapping.interviewTech) || null,
      offerReceived: cell(row, fieldMapping.offerReceived) || null,
      result: cell(row, fieldMapping.result) || null,
      notes: cell(row, fieldMapping.notes) || null,
    });
  }

  return { applications, headers, fieldMapping };
}
