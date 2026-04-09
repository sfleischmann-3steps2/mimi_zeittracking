"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  LayoutDashboard,
  List,
  BarChart3,
  Settings,
  Trash2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/zeiterfassung", label: "Zeiterfassung", icon: Clock },
  { href: "/eintraege", label: "Einträge", icon: List },
  {
    label: "Berichte",
    icon: BarChart3,
    children: [
      { href: "/berichte/tag", label: "Tagesreport" },
      { href: "/berichte/monat", label: "Monatsreport" },
      { href: "/berichte/auftraggeber", label: "Auftraggeber" },
      { href: "/berichte/projekt", label: "Projekt" },
    ],
  },
  {
    label: "Verwaltung",
    icon: Settings,
    children: [
      { href: "/verwaltung/auftraggeber", label: "Auftraggeber" },
      { href: "/verwaltung/projekte", label: "Projekte" },
      { href: "/verwaltung/aufgabenbereiche", label: "Aufgabenbereiche" },
      { href: "/verwaltung/ueberstunden", label: "Überstunden" },
    ],
  },
  { href: "/papierkorb", label: "Papierkorb", icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-gray-800 p-2 text-white"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-tight">mimi</h1>
          <p className="text-xs text-gray-400 mt-1">Zeiterfassung</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            if ("children" in item && item.children) {
              const isActive = item.children.some((c) =>
                pathname.startsWith(c.href)
              );
              return (
                <div key={item.label} className="mt-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase text-gray-400">
                    <item.icon size={16} />
                    {item.label}
                  </div>
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === child.href
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-gray-800"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
