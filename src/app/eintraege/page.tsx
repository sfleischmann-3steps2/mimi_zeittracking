import { List } from "lucide-react";

export default function Eintraege() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <List size={28} /> Einträge
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Alle Zeiteinträge werden hier angezeigt.</p>
      </div>
    </div>
  );
}
