import { prisma } from "./db";

export async function getOvertimeForProject(
  projectId: string,
  year: number,
  month: number
): Promise<{ sollZeit: number; ueberstundenAktiv: boolean } | null> {
  // Find the rule that applies for the middle of the month
  const refDate = new Date(year, month - 1, 15);

  const rule = await prisma.overtimeRule.findFirst({
    where: {
      projectId,
      gueltigAb: { lte: refDate },
      OR: [{ gueltigBis: null }, { gueltigBis: { gte: refDate } }],
    },
    orderBy: { gueltigAb: "desc" },
  });

  if (!rule) return null;

  return {
    sollZeit: rule.sollZeit,
    ueberstundenAktiv: rule.ueberstundenAktiv,
  };
}
