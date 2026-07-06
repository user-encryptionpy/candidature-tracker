import { prisma } from "@/lib/prisma";

// Flip applications that have sat in APPLIED with no reply past the profile's
// "no response after N days" threshold over to NO_RESPONSE. Called on read so
// the dashboard and stats are always up to date without a background job.
export async function applyAutoNoResponse() {
  const profile = await prisma.profile.findUnique({
    where: { id: 1 },
    select: { noResponseDays: true },
  });
  const days = profile?.noResponseDays ?? 7;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  await prisma.application.updateMany({
    where: {
      status: "APPLIED",
      dateResponse: null,
      dateApplied: { lt: cutoff },
    },
    data: { status: "NO_RESPONSE" },
  });
}
