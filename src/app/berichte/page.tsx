import Link from "next/link";
import { Calendar, CalendarDays, Users, FolderOpen } from "lucide-react";

const reports = [
  {
    href: "/berichte/tag",
    title: "Tagesreport",
    description: "Alle Einträge eines Tages, gruppiert nach Projekt",
    icon: Calendar,
    color: "bg-blue-50 text-blue-700",
  },
  {
    href: "/berichte/monat",
    title: "Monatsreport",
    description: "Monatsübersicht mit Soll/Ist und Überstunden",
    icon: CalendarDays,
    color: "bg-green-50 text-green-700",
  },
  {
    href: "/berichte/auftraggeber",
    title: "Auftraggeber-Report",
    description: "Stunden pro Auftraggeber, ideal für Abrechnungen",
    icon: Users,
    color: "bg-purple-50 text-purple-700",
  },
  {
    href: "/berichte/projekt",
    title: "Projekt-Report",
    description: "Stunden pro Projekt, aufgeschlüsselt nach Aufgabenbereich",
    icon: FolderOpen,
    color: "bg-orange-50 text-orange-700",
  },
];

export default function Berichte() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Berichte</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${report.color}`}>
                <report.icon size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{report.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
