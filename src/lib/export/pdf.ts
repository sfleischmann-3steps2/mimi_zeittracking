import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfReportOptions {
  title: string;
  subtitle?: string;
  summaryRows?: [string, string][];
  tables?: {
    title?: string;
    headers: string[];
    rows: (string | number)[][];
  }[];
}

export function generatePDF(options: PdfReportOptions): jsPDF {
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("mimi Zeiterfassung", 14, y);
  y += 10;

  doc.setFontSize(14);
  doc.text(options.title, 14, y);
  y += 6;

  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(options.subtitle, 14, y);
    doc.setTextColor(0);
    y += 8;
  }

  // Summary
  if (options.summaryRows && options.summaryRows.length > 0) {
    y += 4;
    doc.setFontSize(10);
    for (const [label, value] of options.summaryRows) {
      doc.setFont("helvetica", "normal");
      doc.text(label + ":", 14, y);
      doc.setFont("helvetica", "bold");
      doc.text(value, 60, y);
      y += 6;
    }
    y += 4;
  }

  // Tables
  if (options.tables) {
    for (const table of options.tables) {
      if (table.title) {
        y += 4;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(table.title, 14, y);
        y += 2;
      }

      autoTable(doc, {
        startY: y,
        head: [table.headers],
        body: table.rows.map((row) => row.map(String)),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(
      `Erstellt am ${new Date().toLocaleDateString("de-DE")} | Seite ${i}/${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  return doc;
}
