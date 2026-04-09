import { NextRequest, NextResponse } from "next/server";
import {
  getDailyReport,
  getMonthlyReport,
  getClientReport,
  getProjectReport,
} from "@/lib/report-queries";
import {
  generateCSV,
  formatSecondsForExport,
  formatDateForExport,
  formatTimeForExport,
} from "@/lib/export/csv";
import { generatePDF } from "@/lib/export/pdf";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format"); // csv or pdf
  const type = searchParams.get("type");

  if (!format || !type) {
    return NextResponse.json({ error: "format and type required" }, { status: 400 });
  }

  switch (type) {
    case "daily": {
      const date = searchParams.get("date");
      if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
      const report = await getDailyReport(new Date(date));
      const dateStr = new Date(date).toLocaleDateString("de-DE");

      if (format === "csv") {
        const headers = ["Datum", "Start", "Ende", "Dauer", "Auftraggeber", "Projekt", "Tätigkeit", "Bereich", "Notizen"];
        const rows = report.entries.map((e: any) => [
          formatDateForExport(new Date(e.date)),
          formatTimeForExport(new Date(e.startTime)),
          e.endTime ? formatTimeForExport(new Date(e.endTime)) : "",
          e.duration ? formatSecondsForExport(e.duration) : "",
          e.project.client.name,
          e.project.name,
          e.taetigkeit,
          e.taskArea?.name || "",
          e.notes || "",
        ]);
        return csvResponse(generateCSV(headers, rows), `tagesreport_${date}.csv`);
      }

      const doc = generatePDF({
        title: `Tagesreport ${dateStr}`,
        summaryRows: [
          ["Gesamtzeit", formatSecondsForExport(report.totalDuration) + " h"],
          ["Einträge", String(report.entries.length)],
        ],
        tables: [{
          headers: ["Start", "Ende", "Dauer", "Projekt", "Tätigkeit", "Bereich"],
          rows: report.entries.map((e: any) => [
            formatTimeForExport(new Date(e.startTime)),
            e.endTime ? formatTimeForExport(new Date(e.endTime)) : "",
            e.duration ? formatSecondsForExport(e.duration) : "",
            e.project.name,
            e.taetigkeit,
            e.taskArea?.name || "",
          ]),
        }],
      });
      return pdfResponse(doc, `tagesreport_${date}.pdf`);
    }

    case "monthly": {
      const year = parseInt(searchParams.get("year") || "");
      const month = parseInt(searchParams.get("month") || "");
      if (!year || !month) return NextResponse.json({ error: "year and month required" }, { status: 400 });
      const report = await getMonthlyReport(year, month);
      const monthName = MONTH_NAMES[month - 1];

      if (format === "csv") {
        const headers = ["Projekt", "Auftraggeber", "Ist-Stunden", "Soll-Stunden", "Überstunden"];
        const rows = report.byProject.map((p: any) => [
          p.name,
          p.client,
          formatSecondsForExport(p.duration),
          p.sollZeit !== null ? `${p.sollZeit} h` : "",
          p.ueberstunden !== null ? `${p.ueberstunden.toFixed(1)} h` : "",
        ]);
        return csvResponse(generateCSV(headers, rows), `monatsreport_${year}_${month}.csv`);
      }

      const doc = generatePDF({
        title: `Monatsreport ${monthName} ${year}`,
        summaryRows: [
          ["Gesamtzeit", formatSecondsForExport(report.totalDuration) + " h"],
          ["Arbeitstage", String(report.days.filter((d: any) => d.duration > 0).length)],
          ["Einträge", String(report.entryCount)],
        ],
        tables: [{
          title: "Nach Projekt",
          headers: ["Projekt", "Auftraggeber", "Ist-Stunden", "Soll-Stunden", "Überstunden"],
          rows: report.byProject.map((p: any) => [
            p.name,
            p.client,
            formatSecondsForExport(p.duration),
            p.sollZeit !== null ? `${p.sollZeit} h` : "–",
            p.ueberstunden !== null ? `${p.ueberstunden >= 0 ? "+" : ""}${p.ueberstunden.toFixed(1)} h` : "–",
          ]),
        }, {
          title: "Tagesübersicht",
          headers: ["Datum", "Stunden"],
          rows: report.days
            .filter((d: any) => d.duration > 0)
            .map((d: any) => [d.date, formatSecondsForExport(d.duration)]),
        }],
      });
      return pdfResponse(doc, `monatsreport_${year}_${month}.pdf`);
    }

    case "client": {
      const clientId = searchParams.get("clientId");
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      if (!clientId || !from || !to)
        return NextResponse.json({ error: "clientId, from, to required" }, { status: 400 });
      const report = await getClientReport(clientId, new Date(from), new Date(to));

      if (format === "csv") {
        const headers = ["Datum", "Start", "Ende", "Dauer", "Projekt", "Tätigkeit", "Bereich"];
        const rows: (string | number)[][] = [];
        for (const proj of report.byProject) {
          for (const e of proj.entries) {
            rows.push([
              formatDateForExport(new Date(e.date)),
              formatTimeForExport(new Date(e.startTime)),
              e.endTime ? formatTimeForExport(new Date(e.endTime)) : "",
              e.duration ? formatSecondsForExport(e.duration) : "",
              proj.name,
              e.taetigkeit,
              e.taskArea?.name || "",
            ]);
          }
        }
        return csvResponse(generateCSV(headers, rows), `auftraggeber_${report.clientName}.csv`);
      }

      const tables = report.byProject.map((proj: any) => ({
        title: proj.name + ` (${formatSecondsForExport(proj.duration)} h)`,
        headers: ["Datum", "Start", "Ende", "Dauer", "Tätigkeit"],
        rows: proj.entries.map((e: any) => [
          formatDateForExport(new Date(e.date)),
          formatTimeForExport(new Date(e.startTime)),
          e.endTime ? formatTimeForExport(new Date(e.endTime)) : "",
          e.duration ? formatSecondsForExport(e.duration) : "",
          e.taetigkeit,
        ]),
      }));

      const doc = generatePDF({
        title: `Auftraggeber-Report: ${report.clientName}`,
        subtitle: `${new Date(from).toLocaleDateString("de-DE")} – ${new Date(to).toLocaleDateString("de-DE")}`,
        summaryRows: [
          ["Gesamtzeit", formatSecondsForExport(report.totalDuration) + " h"],
          ["Einträge", String(report.entryCount)],
          ["Projekte", String(report.byProject.length)],
        ],
        tables,
      });
      return pdfResponse(doc, `auftraggeber_${report.clientName}.pdf`);
    }

    case "project": {
      const projectId = searchParams.get("projectId");
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      if (!projectId || !from || !to)
        return NextResponse.json({ error: "projectId, from, to required" }, { status: 400 });
      const report = await getProjectReport(projectId, new Date(from), new Date(to));

      if (format === "csv") {
        const headers = ["Datum", "Start", "Ende", "Dauer", "Tätigkeit", "Bereich", "Notizen"];
        const rows = report.entries.map((e: any) => [
          formatDateForExport(new Date(e.date)),
          formatTimeForExport(new Date(e.startTime)),
          e.endTime ? formatTimeForExport(new Date(e.endTime)) : "",
          e.duration ? formatSecondsForExport(e.duration) : "",
          e.taetigkeit,
          e.taskArea?.name || "",
          e.notes || "",
        ]);
        return csvResponse(generateCSV(headers, rows), `projekt_${report.projectName}.csv`);
      }

      const doc = generatePDF({
        title: `Projekt-Report: ${report.projectName}`,
        subtitle: `${report.clientName} | ${new Date(from).toLocaleDateString("de-DE")} – ${new Date(to).toLocaleDateString("de-DE")}`,
        summaryRows: [
          ["Gesamtzeit", formatSecondsForExport(report.totalDuration) + " h"],
          ["Einträge", String(report.entryCount)],
        ],
        tables: [
          {
            title: "Nach Aufgabenbereich",
            headers: ["Bereich", "Stunden"],
            rows: report.byTaskArea.map((a: any) => [a.name, formatSecondsForExport(a.duration)]),
          },
          {
            title: "Alle Einträge",
            headers: ["Datum", "Start", "Ende", "Dauer", "Tätigkeit", "Bereich"],
            rows: report.entries.map((e: any) => [
              formatDateForExport(new Date(e.date)),
              formatTimeForExport(new Date(e.startTime)),
              e.endTime ? formatTimeForExport(new Date(e.endTime)) : "",
              e.duration ? formatSecondsForExport(e.duration) : "",
              e.taetigkeit,
              e.taskArea?.name || "",
            ]),
          },
        ],
      });
      return pdfResponse(doc, `projekt_${report.projectName}.pdf`);
    }

    default:
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }
}

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function pdfResponse(doc: any, filename: string) {
  const buffer = doc.output("arraybuffer");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
