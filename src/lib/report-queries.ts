import { prisma } from "./db";
import { getOvertimeForProject } from "./overtime";

export async function getDailyReport(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const entries = await prisma.timeEntry.findMany({
    where: { date: { gte: start, lt: end }, deletedAt: null },
    include: {
      project: { include: { client: true } },
      taskArea: true,
    },
    orderBy: { startTime: "asc" },
  });

  const totalDuration = entries.reduce((s, e) => s + (e.duration || 0), 0);

  // Group by project
  const byProject: Record<string, { name: string; client: string; duration: number; entries: typeof entries }> = {};
  for (const e of entries) {
    const key = e.projectId;
    if (!byProject[key]) {
      byProject[key] = { name: e.project.name, client: e.project.client.name, duration: 0, entries: [] };
    }
    byProject[key].duration += e.duration || 0;
    byProject[key].entries.push(e);
  }

  return { date: start.toISOString(), totalDuration, entries, byProject: Object.values(byProject) };
}

export async function getMonthlyReport(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const entries = await prisma.timeEntry.findMany({
    where: { date: { gte: start, lt: end }, deletedAt: null },
    include: {
      project: { include: { client: true } },
      taskArea: true,
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const totalDuration = entries.reduce((s, e) => s + (e.duration || 0), 0);

  // Group by day
  const byDay: Record<string, number> = {};
  for (const e of entries) {
    const day = new Date(e.date).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + (e.duration || 0);
  }

  // Group by project with overtime
  const projectMap: Record<string, { name: string; client: string; duration: number; projectId: string }> = {};
  for (const e of entries) {
    if (!projectMap[e.projectId]) {
      projectMap[e.projectId] = {
        name: e.project.name,
        client: e.project.client.name,
        duration: 0,
        projectId: e.projectId,
      };
    }
    projectMap[e.projectId].duration += e.duration || 0;
  }

  const byProject = await Promise.all(
    Object.values(projectMap).map(async (p) => {
      const ot = await getOvertimeForProject(p.projectId, year, month);
      const istStunden = p.duration / 3600;
      return {
        name: p.name,
        client: p.client,
        duration: p.duration,
        sollZeit: ot?.sollZeit ?? null,
        ueberstundenAktiv: ot?.ueberstundenAktiv ?? false,
        ueberstunden: ot?.ueberstundenAktiv ? istStunden - (ot.sollZeit || 0) : null,
      };
    })
  );

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ date: dateStr, duration: byDay[dateStr] || 0 });
  }

  return { year, month, totalDuration, days, byProject, entryCount: entries.length };
}

export async function getClientReport(clientId: string, from: Date, to: Date) {
  const entries = await prisma.timeEntry.findMany({
    where: {
      deletedAt: null,
      date: { gte: from, lt: to },
      project: { clientId },
    },
    include: {
      project: true,
      taskArea: true,
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  const totalDuration = entries.reduce((s, e) => s + (e.duration || 0), 0);

  // Group by project
  const projectMap: Record<string, { name: string; duration: number; entries: typeof entries }> = {};
  for (const e of entries) {
    if (!projectMap[e.projectId]) {
      projectMap[e.projectId] = { name: e.project.name, duration: 0, entries: [] };
    }
    projectMap[e.projectId].duration += e.duration || 0;
    projectMap[e.projectId].entries.push(e);
  }

  return {
    clientName: client?.name || "",
    totalDuration,
    byProject: Object.values(projectMap),
    entryCount: entries.length,
  };
}

export async function getProjectReport(projectId: string, from: Date, to: Date) {
  const entries = await prisma.timeEntry.findMany({
    where: {
      deletedAt: null,
      date: { gte: from, lt: to },
      projectId,
    },
    include: {
      project: { include: { client: true } },
      taskArea: true,
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  const totalDuration = entries.reduce((s, e) => s + (e.duration || 0), 0);

  // Group by task area
  const areaMap: Record<string, { name: string; duration: number }> = {};
  for (const e of entries) {
    const key = e.taskAreaId || "_none";
    const name = e.taskArea?.name || "Ohne Bereich";
    if (!areaMap[key]) {
      areaMap[key] = { name, duration: 0 };
    }
    areaMap[key].duration += e.duration || 0;
  }

  // Group by day
  const byDay: Record<string, number> = {};
  for (const e of entries) {
    const day = new Date(e.date).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + (e.duration || 0);
  }

  return {
    projectName: project?.name || "",
    clientName: project?.client.name || "",
    totalDuration,
    byTaskArea: Object.values(areaMap),
    byDay: Object.entries(byDay).map(([date, duration]) => ({ date, duration })),
    entries,
    entryCount: entries.length,
  };
}
