import { Trash2 } from "lucide-react";

export default function Papierkorb() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <Trash2 size={28} /> Papierkorb
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Gelöschte Einträge werden hier angezeigt.</p>
      </div>
    </div>
  );
}
