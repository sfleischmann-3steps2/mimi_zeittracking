import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekStart = new Date(todayStart);
    const day = weekStart.getDay();
    const diff = day === 0 ? 6 : day - 1;
    weekStart.setDate(weekStart.getDate() - diff);

    const [todayEntries, weekEntries, clientCount, projectCount, recentEntries] =
      await Promise.all([
        prisma.timeEntry.findMany({
          where: { date: { gte: todayStart, lt: todayEnd }, deletedAt: null },
          select: { duration: true },
        }),
        prisma.timeEntry.findMany({
          where: { date: { gte: weekStart, lt: todayEnd }, deletedAt: null },
          select: { duration: true },
        }),
        prisma.client.count(),
        prisma.project.count(),
        prisma.timeEntry.findMany({
          where: { deletedAt: null },
          include: {
            project: { include: { client: true } },
            taskArea: true,
          },
          orderBy: [{ date: "desc" }, { startTime: "desc" }],
          take: 5,
        }),
      ]);

    const todayTotal = todayEntries.reduce((s, e) => s + (e.duration || 0), 0);
    const weekTotal = weekEntries.reduce((s, e) => s + (e.duration || 0), 0);

    return NextResponse.json({
      todayTotal,
      weekTotal,
      clientCount,
      projectCount,
      recentEntries,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Fehler beim Laden des Dashboards" }, { status: 500 });
  }
}
