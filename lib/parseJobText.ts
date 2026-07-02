import { detectGeo, findCountryForCity, normalizeCountry } from "./geo";

export interface ParsedJobFields {
  jobTitle?: string;
  company?: string;
  url?: string;
  contactEmail?: string;
  salary?: string;
  location?: string;
  country?: string;
  source?: string;
  contractType?: string;
  dateApplied?: string;
  notes?: string;
}

// LinkedIn "Your application was sent to X" confirmation emails have a fixed
// shape: header line, company, job title, "Company · City (Work mode)", then
// "Applied on <date>". Parse it directly for a near-complete pre-fill.
function parseLinkedInEmail(
  text: string,
  lines: string[],
  result: ParsedJobFields
): boolean {
  const sent = text.match(/your application was sent to\s+(.+)/i);
  if (!sent) return false;

  const company = sent[1].trim();
  result.company = company;
  if (!result.source) result.source = "LinkedIn";

  // "Company · Kenitra (On-site)" — city on the right of the middot.
  const dotLine = lines.find((l) => l.includes("·"));
  if (dotLine) {
    const right = dotLine.split("·").pop()!.trim();
    const m = right.match(/^([^(]+?)\s*(?:\(([^)]+)\))?$/);
    if (m) {
      if (m[1]) result.location = m[1].trim();
      if (m[2] && !result.notes) result.notes = `Work mode: ${m[2].trim()}`;
    }
  }

  const applied = text.match(/applied on\s+([A-Za-z]+\.?\s+\d{1,2},?\s+\d{4})/i);
  if (applied) {
    const d = new Date(applied[1]);
    if (!isNaN(d.getTime())) {
      // Use local date parts — toISOString() would shift the day in +N timezones.
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      result.dateApplied = `${d.getFullYear()}-${mm}-${dd}`;
    }
  }

  // Job title = the first content line that isn't the header, the company,
  // the "· city" line, or the "Applied on" line.
  const title = lines.find((l) => {
    const t = l.trim();
    return (
      !!t &&
      t !== company &&
      !/your application was sent/i.test(t) &&
      !/applied on/i.test(t) &&
      !t.includes("·")
    );
  });
  if (title) result.jobTitle = title;

  return true;
}

// The canonical quick-fill template — paste this exact structure and every
// line maps 1:1 onto a form field. Shown on /new via the "Copy template" button.
export const PASTE_TEMPLATE = `Entreprise:
Poste:
Contrat:
Pays:
Ville:
Salaire:
Source:
URL:
Date:
Email:
Notes: `;

const LABELED_PATTERNS: [RegExp, keyof ParsedJobFields][] = [
  [/(?:poste|job title|titre|intitul[ée])\s*[:\-]\s*(.+)/i, "jobTitle"],
  [/(?:entreprise|company|soci[ée]t[ée])\s*[:\-]\s*(.+)/i, "company"],
  [/(?:lieu|location|ville)\s*[:\-]\s*(.+)/i, "location"],
  [/(?:pays|country)\s*[:\-]\s*(.+)/i, "country"],
  [/(?:salaire|salary|r[ée]mun[ée]ration|tjm)\s*[:\-]\s*(.+)/i, "salary"],
  [/(?:type de contrat|type contrat|contract type|contrat|type de poste)\s*[:\-]\s*(.+)/i, "contractType"],
  [/(?:source|plateforme)\s*[:\-]\s*(.+)/i, "source"],
  [/(?:url|lien|link)\s*[:\-]\s*(.+)/i, "url"],
  [/(?:date postulation|date candidature|date(?!\s+relance))\s*[:\-]\s*(.+)/i, "dateApplied"],
  [/(?:e-?mail|contact e-?mail)\s*[:\-]\s*(.+)/i, "contactEmail"],
  [/(?:notes?|commentaires?|remarques?)\s*[:\-]\s*(.+)/i, "notes"],
];

// Accepts dd/mm/yyyy, yyyy-mm-dd, or natural-language dates → yyyy-mm-dd (local).
function normalizeDateInput(raw: string): string | undefined {
  const fr = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (fr) {
    return `${fr[3]}-${fr[2].padStart(2, "0")}-${fr[1].padStart(2, "0")}`;
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) return undefined;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Domain → recruiting-site name, used to auto-detect Source from a pasted URL.
const SOURCE_DOMAINS: Record<string, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
  welcometothejungle: "Welcome to the Jungle",
  wttj: "Welcome to the Jungle",
  monster: "Monster",
  rekrute: "Rekrute",
  emploi: "Emploi.ma",
  wadifa: "Wadifaweb",
  bayt: "Bayt",
  hellowork: "HelloWork",
  apec: "APEC",
  "pole-emploi": "Pôle Emploi",
  francetravail: "France Travail",
  greenhouse: "Greenhouse",
  lever: "Lever",
  workday: "Workday",
  smartrecruiters: "SmartRecruiters",
};

// Contract-type keyword → canonical label.
const CONTRACT_KEYWORDS: [RegExp, string][] = [
  [/\bpfe\b|projet de fin d'?[ée]tudes?/i, "PFE"],
  [/\bstage\b|internship|stagiaire|\bintern\b/i, "Stage"],
  [/\balternance\b|apprentissage|\bapprentice/i, "Alternance"],
  [/\bcdi\b|permanent/i, "CDI"],
  [/\bcdd\b|fixed[- ]term/i, "CDD"],
  [/freelance|ind[ée]pendant|contractor/i, "Freelance"],
  [/int[ée]rim|temporary/i, "Intérim"],
];

function detectSourceFromUrl(url: string): string | undefined {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
  for (const [key, label] of Object.entries(SOURCE_DOMAINS)) {
    if (host.includes(key)) return label;
  }
  return undefined;
}

// Career sites (Indeed job pages, Safran-style postings) cram several
// "Label : value" pairs on a single line — break them apart so each labeled
// pattern sees its own line.
const INLINE_LABELS =
  /(?<!^)\s+(?=(?:Company|Job field|Location|Contract type|Contract duration|Required degree|Required experience|Professional status|Spoken language|Entreprise|Poste|Ville|Pays|Salaire|Source)\s*:)/g;

// Page-chrome lines that must never be mistaken for a job title.
const JUNK_TITLE =
  /^(détails de l'emploi|description du poste|job details|job description|type de poste|lieu|correspondance entre|published|temps plein|full[- ]time|&nbsp;?)/i;

// Best-effort pre-fill only: everything it produces is shown in an editable
// form, so a wrong or missing guess just means the user types it themselves.
export function parseJobText(
  rawText: string,
  knownCompanies: string[] = []
): ParsedJobFields {
  const result: ParsedJobFields = {};
  const text = rawText.replace(/&nbsp;/g, " ").replace(INLINE_LABELS, "\n");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // LinkedIn confirmation emails get a dedicated parser; if it matches, the
  // generic heuristics below only fill whatever it left blank.
  parseLinkedInEmail(text, lines, result);

  for (const line of lines) {
    for (const [regex, field] of LABELED_PATTERNS) {
      if (result[field]) continue;
      const match = line.match(regex);
      if (!match) continue;
      const value = match[1].trim();
      if (!value) continue;
      if (field === "dateApplied") {
        const normalized = normalizeDateInput(value);
        if (normalized) result.dateApplied = normalized;
      } else {
        result[field] = value;
      }
    }
  }

  const urlMatch = text.match(/https?:\/\/[^\s)>\]]+/);
  if (urlMatch) {
    result.url = urlMatch[0].replace(/[.,;]+$/, "");
    if (!result.source) {
      const source = detectSourceFromUrl(result.url);
      if (source) result.source = source;
    }
  }

  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) result.contactEmail = emailMatch[0];

  if (!result.salary) {
    const salaryMatch = text.match(
      /\b\d[\d\s.,]{1,9}\s?(k€|k\$|€|\$|k|MAD|DH|USD|EUR)\b/i
    );
    if (salaryMatch) result.salary = salaryMatch[0].trim();
  }

  // Canonicalize the contract value ("Permanent" → CDI, "Internship" → Stage);
  // if nothing was labeled, fall back to scanning the whole text.
  for (const [regex, label] of CONTRACT_KEYWORDS) {
    if (result.contractType) {
      if (regex.test(result.contractType)) {
        result.contractType = label;
        break;
      }
    } else if (regex.test(text)) {
      result.contractType = label;
      break;
    }
  }

  if (!result.company) {
    const known = knownCompanies.find((c) =>
      text.toLowerCase().includes(c.toLowerCase())
    );
    if (known) result.company = known;
  }

  if (!result.company) {
    const atMatch = text.match(/\b(?:at|chez)\s+([A-Z][\w&.\- ]{1,40})/);
    if (atMatch) result.company = atMatch[1].trim();
  }

  // Geo enrichment: "Ville: Casablanca , Morocco" → split city/country;
  // canonicalize country names; derive country from a known city; and as a
  // last resort scan the whole text for a known city or country.
  if (result.location && result.location.includes(",")) {
    const [cityPart, countryPart] = result.location.split(",").map((s) => s.trim());
    const canonical = normalizeCountry(countryPart);
    if (canonical) {
      result.location = cityPart;
      if (!result.country) result.country = canonical;
    }
  }
  if (result.country) {
    result.country = normalizeCountry(result.country) ?? result.country;
  }
  if (result.location && !result.country) {
    result.country = findCountryForCity(result.location);
  }
  if (!result.location || !result.country) {
    const geo = detectGeo(text);
    if (!result.location && geo.city) result.location = geo.city;
    if (!result.country && geo.country) result.country = geo.country;
    if (geo.workMode && !result.notes) result.notes = `Work mode: ${geo.workMode}`;
  }

  // Title fallback runs last so it can rule out lines that turned out to be
  // the company, the city, or page chrome.
  if (!result.jobTitle) {
    const candidate = lines.find(
      (l) =>
        l.length >= 8 &&
        !JUNK_TITLE.test(l) &&
        !l.includes(":") &&
        l !== result.company &&
        !findCountryForCity(l)
    );
    if (candidate) result.jobTitle = candidate.slice(0, 120);
  }

  return result;
}
