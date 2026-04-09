"use client";

import { useState, useEffect } from "react";
import { Clock, Users, FolderOpen, TrendingUp } from "lucide-react";
import { formatDuration, formatTime, formatDate } from "@/lib/time-utils";
import Link from "next/link";

interface DashboardData {
  todayTotal: number;
  weekTotal: number;
  clientCount: number;
  projectCount: number;
  recentEntries: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="text-gray-500 text-sm p-6">Laden...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Heute"
          value={`${formatDuration(data.todayTotal)} h`}
          icon={<Clock className="text-blue-500" size={24} />}
        />
        <DashboardCard
          title="Diese Woche"
          value={`${formatDuration(data.weekTotal)} h`}
          icon={<TrendingUp className="text-green-500" size={24} />}
        />
        <DashboardCard
          title="Auftraggeber"
          value={String(data.clientCount)}
          icon={<Users className="text-purple-500" size={24} />}
        />
        <DashboardCard
          title="Projekte"
          value={String(data.projectCount)}
          icon={<FolderOpen className="text-orange-500" size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Letzte Einträge
            </h2>
            <Link
              href="/eintraege"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Alle anzeigen
            </Link>
          </div>

          {data.recentEntries.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Noch keine Zeiteinträge vorhanden.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentEntries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.taetigkeit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.project.client.name} / {entry.project.name}
                      {" · "}
                      {formatDate(new Date(entry.date))}
                    </p>
                  </div>
                  <div className="text-sm font-mono text-gray-700">
                    {entry.duration ? formatDuration(entry.duration) : "–"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Schnellstart
          </h2>
          <div className="space-y-3">
            <Link
              href="/zeiterfassung"
              className="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              <Clock size={20} />
              <span className="font-medium">Timer starten</span>
            </Link>
            <Link
              href="/verwaltung/auftraggeber"
              className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Users size={20} />
              <span className="font-medium">Auftraggeber verwalten</span>
            </Link>
            <Link
              href="/berichte/monat"
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <TrendingUp size={20} />
              <span className="font-medium">Monatsreport ansehen</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
