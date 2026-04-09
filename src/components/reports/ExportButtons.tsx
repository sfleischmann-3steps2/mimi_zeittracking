"use client";

import { Download } from "lucide-react";

interface ExportButtonsProps {
  params: Record<string, string>;
}

export default function ExportButtons({ params }: ExportButtonsProps) {
  const queryString = new URLSearchParams(params).toString();

  const handleExport = (format: "csv" | "pdf") => {
    window.open(`/api/export?format=${format}&${queryString}`, "_blank");
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport("csv")}
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Download size={14} /> CSV
      </button>
      <button
        onClick={() => handleExport("pdf")}
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Download size={14} /> PDF
      </button>
    </div>
  );
}
