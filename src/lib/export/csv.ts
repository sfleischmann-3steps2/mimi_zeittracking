import Papa from "papaparse";

export function generateCSV(
  headers: string[],
  rows: (string | number)[][]
): string {
  return Papa.unparse({
    fields: headers,
    data: rows,
  }, {
    delimiter: ";",
  });
}

export function formatSecondsForExport(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function formatDateForExport(date: Date): string {
  return date.toLocaleDateString("de-DE");
}

export function formatTimeForExport(date: Date): string {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}
