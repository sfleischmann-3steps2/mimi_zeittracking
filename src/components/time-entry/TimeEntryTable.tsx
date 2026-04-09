"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { formatDuration, formatTime, formatDate } from "@/lib/time-utils";

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  taetigkeit: string;
  notes: string | null;
  project: {
    name: string;
    client: { name: string };
  };
  taskArea: { name: string } | null;
}

export default function TimeEntryTable({
  entries,
  onDelete,
}: {
  entries: TimeEntry[];
  onDelete?: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/time-entries/${id}`, { method: "DELETE" });
      onDelete?.(id);
    } finally {
      setDeleting(null);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-sm text-center">
          Keine Einträge vorhanden.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Datum
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Zeit
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Dauer
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Auftraggeber
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Projekt
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Tätigkeit
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Bereich
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(new Date(entry.date))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatTime(new Date(entry.startTime))}
                  {entry.endTime && ` – ${formatTime(new Date(entry.endTime))}`}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono">
                  {entry.duration ? formatDuration(entry.duration) : "–"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {entry.project.client.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {entry.project.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {entry.taetigkeit}
                  {entry.notes && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {entry.notes}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                  {entry.taskArea?.name || "–"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleting === entry.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    title="Löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
