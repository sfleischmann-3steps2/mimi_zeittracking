"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import Timer from "@/components/timer/Timer";
import TimeEntryForm from "@/components/time-entry/TimeEntryForm";
import TimeEntryTable from "@/components/time-entry/TimeEntryTable";
import { toDateString, formatDuration } from "@/lib/time-utils";

export default function Zeiterfassung() {
  const [entries, setEntries] = useState<any[]>([]);
  const [totalToday, setTotalToday] = useState(0);

  const loadEntries = useCallback(async () => {
    const today = toDateString(new Date());
    const res = await fetch(`/api/time-entries?date=${today}`);
    const data = await res.json();
    setEntries(data);
    const total = data.reduce(
      (sum: number, e: any) => sum + (e.duration || 0),
      0
    );
    setTotalToday(total);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setTotalToday((prev) =>
      prev - (entries.find((e) => e.id === id)?.duration || 0)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Clock size={28} /> Zeiterfassung
        </h1>
        {totalToday > 0 && (
          <div className="text-sm text-gray-500">
            Heute: <span className="font-semibold text-gray-900">{formatDuration(totalToday)} h</span>
          </div>
        )}
      </div>

      <Timer onStop={loadEntries} />

      <TimeEntryForm onSaved={loadEntries} />

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Heutige Einträge
        </h2>
        <TimeEntryTable entries={entries} onDelete={handleDelete} onUpdate={loadEntries} />
      </div>
    </div>
  );
}
