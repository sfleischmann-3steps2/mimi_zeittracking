import { Clock, Users, FolderOpen, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Heute"
          value="0:00 h"
          icon={<Clock className="text-blue-500" size={24} />}
        />
        <DashboardCard
          title="Diese Woche"
          value="0:00 h"
          icon={<TrendingUp className="text-green-500" size={24} />}
        />
        <DashboardCard
          title="Auftraggeber"
          value="0"
          icon={<Users className="text-purple-500" size={24} />}
        />
        <DashboardCard
          title="Projekte"
          value="0"
          icon={<FolderOpen className="text-orange-500" size={24} />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Letzte Einträge
        </h2>
        <p className="text-gray-500 text-sm">
          Noch keine Zeiteinträge vorhanden. Starte mit der Zeiterfassung!
        </p>
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
