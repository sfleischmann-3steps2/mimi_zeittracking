"use client";

import { useState, useEffect } from "react";
import { Trash2, RotateCcw, X } from "lucide-react";
import { formatDuration, formatTime, formatDate } from "@/lib/time-utils";

export default function Papierkorb() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/time-entries?includeDeleted=true");
    const data = await res.json();
    setEntries(data.filter((e: any) => e.deletedAt !== null));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (id: string) => {
    await fetch(`/api/time-entries/${id}/restore`, { method: "PATCH" });
    load();
  };

  const handlePermanentDelete = async (id: string) => {
    await fetch(`/api/time-entries/${id}/permanent`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <Trash2 size={28} /> Papierkorb
      </h1>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-sm text-center">Laden...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-sm text-center">
            Der Papierkorb ist leer.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tätigkeit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Projekt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dauer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Gelöscht am</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(new Date(entry.date))}
                  </td>
                  <td className="px-4 py-3">{entry.taetigkeit}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-500">{entry.project.client.name}</span>
                    {" / "}
                    {entry.project.name}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {entry.duration ? formatDuration(entry.duration) : "–"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(new Date(entry.deletedAt))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleRestore(entry.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors"
                        title="Wiederherstellen"
                      >
                        <RotateCcw size={14} /> Wiederherstellen
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(entry.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                        title="Endgültig löschen"
                      >
                        <X size={14} /> Endgültig
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
