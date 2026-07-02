export type ApplicationStatus =
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "NO_RESPONSE";

export interface Application {
  id: number;
  company: string;
  jobTitle: string;
  url: string | null;
  contractType: string | null;
  country: string | null;
  location: string | null;
  dateApplied: string;
  status: ApplicationStatus;
  source: string | null;
  salary: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  nextFollowUp: string | null;
  dateResponse: string | null;
  interviewHR: string | null;
  interviewTech: string | null;
  offerReceived: string | null;
  result: string | null;
  notes: string | null;
  rawPastedText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  statusBreakdown: { status: string; count: number }[];
  funnel: {
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
    interviewRate: number;
    offerRate: number;
    responseRate: number;
    avgResponseDays: number | null;
  };
  volume: { week: string; count: number }[];
  pendingFollowUps: Application[];
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  NO_RESPONSE: "No response",
};

// Matches the Excel workbook's own conditional-formatting palette (good/bad/neutral
// cell styles) so the app's status colors read the same as the original sheet.
export const STATUS_BADGE_COLORS: Record<
  ApplicationStatus,
  { bg: string; text: string }
> = {
  APPLIED: { bg: "#FFEB9C", text: "#9C5700" },
  INTERVIEW: { bg: "#BDD7EE", text: "#1F3864" },
  OFFER: { bg: "#C6EFCE", text: "#006100" },
  REJECTED: { bg: "#FFC7CE", text: "#9C0006" },
  NO_RESPONSE: { bg: "#D9D9D9", text: "#404040" },
};

// Solid variant (the badge's text color) used for chart fills.
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: STATUS_BADGE_COLORS.APPLIED.text,
  INTERVIEW: STATUS_BADGE_COLORS.INTERVIEW.text,
  OFFER: STATUS_BADGE_COLORS.OFFER.text,
  REJECTED: STATUS_BADGE_COLORS.REJECTED.text,
  NO_RESPONSE: STATUS_BADGE_COLORS.NO_RESPONSE.text,
};
