"use client";

import { useState, useEffect } from "react";
import { List } from "lucide-react";
import TimeEntryTable from "@/components/time-entry/TimeEntryTable";
import { formatDuration } from "@/lib/time-utils";

export default function Eintraege() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    setLoading(true);
    const res = await fetch("/api/time-entries");
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const totalDuration = entries.reduce(
    (sum, e) => sum + (e.duration || 0),
    0
  );

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <List size={28} /> Alle Einträge
        </h1>
        {entries.length > 0 && (
          <div className="text-sm text-gray-500">
            {entries.length} Einträge ·{" "}
            <span className="font-semibold text-gray-900">
              {formatDuration(totalDuration)} h
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-sm text-center">Laden...</p>
        </div>
      ) : (
        <TimeEntryTable entries={entries} onDelete={handleDelete} onUpdate={loadEntries} />
      )}
    </div>
  );
}
