# mimi_zeittracking - Implementierungsplan

## Überblick

Zeiterfassungs-App für die schnelle Erfassung von Arbeitszeiten über mehrere Auftraggeber und Projekte hinweg. Automatische Berechnung der Arbeitszeiten und flexible Reports (Tages-, Monats-, Auftraggeber-, Projektreports) mit PDF/CSV-Export.

**Ausgangspunkt:** Excel-Prototyp (`Zeiterfassung_leer_ - Steffi.xlsm`) mit VBA-Makros, Timer-Funktion und zwei Report-Sheets.

---

## Tech-Stack

| Komponente | Technologie | Warum |
|---|---|---|
| Framework | **Next.js 14+ (App Router, TypeScript)** | Fullstack, file-based routing, Server Components für Reports, einfaches Vercel-Deployment |
| Datenbank | **SQLite via Prisma** | Zero-Config, file-basiert, schnell für Aggregationen. Später einfach auf PostgreSQL/Supabase umstellbar |
| UI | **Tailwind CSS + shadcn/ui** | Moderne, anpassbare Komponenten ohne schwere Library-Abhängigkeit |
| Charts | **Recharts** | Leichtgewichtig, React-nativ |
| Export | **jsPDF + Papa Parse** | PDF- und CSV-Export direkt aus der App |
| Datums-Handling | **date-fns** | Leichtgewichtig, deutsche Locale verfügbar |
| Validierung | **Zod** | Schema-Validierung für Forms und API |

---

## Datenmodell

```
Auftraggeber (Client)
  └── Projekt (Project)

Aufgabengebiet (TaskArea) — projektübergreifend

Zeiteintrag (TimeEntry)
  ├── Datum, Start, Ende, Dauer (automatisch berechnet, in Sekunden)
  ├── Tätigkeit (Freitext)
  ├── → Projekt (→ Auftraggeber)
  ├── → Aufgabengebiet
  ├── Notizen
  └── deletedAt (Soft Delete = Papierkorb)

Überstundenregel (OvertimeRule)
  ├── → Projekt
  ├── Soll-Zeit (Stunden)
  ├── Überstunden aktiv (Ja/Nein)
  ├── Gültig ab / Gültig bis
```

### Prisma Schema

```prisma
model Client {
  id        String    @id @default(cuid())
  name      String    @unique
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Project {
  id             String          @id @default(cuid())
  name           String
  client         Client          @relation(fields: [clientId], references: [id])
  clientId       String
  timeEntries    TimeEntry[]
  overtimeRules  OvertimeRule[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  @@unique([name, clientId])
}

model TaskArea {
  id          String      @id @default(cuid())
  name        String      @unique
  timeEntries TimeEntry[]
}

model TimeEntry {
  id         String    @id @default(cuid())
  date       DateTime
  startTime  DateTime
  endTime    DateTime?
  duration   Int?            // Sekunden, automatisch berechnet
  taetigkeit String
  project    Project   @relation(fields: [projectId], references: [id])
  projectId  String
  taskArea   TaskArea? @relation(fields: [taskAreaId], references: [id])
  taskAreaId String?
  notes      String?
  deletedAt  DateTime?       // Soft Delete (Papierkorb)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model OvertimeRule {
  id                String    @id @default(cuid())
  project           Project   @relation(fields: [projectId], references: [id])
  projectId         String
  sollZeit          Float     // Soll-Stunden
  ueberstundenAktiv Boolean   @default(false)
  gueltigAb         DateTime
  gueltigBis        DateTime?
}
```

---

## Projektstruktur

```
mimi_zeittracking/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root Layout mit Sidebar
│   │   ├── page.tsx                          # Dashboard
│   │   ├── zeiterfassung/page.tsx            # Timer + Manuelle Eingabe
│   │   ├── eintraege/page.tsx               # Alle Zeiteinträge (Tabelle)
│   │   ├── berichte/
│   │   │   ├── page.tsx                     # Report-Übersicht
│   │   │   ├── tag/page.tsx                 # Tagesreport
│   │   │   ├── monat/page.tsx               # Monatsreport
│   │   │   ├── auftraggeber/page.tsx        # Auftraggeber-Report
│   │   │   └── projekt/page.tsx             # Projekt-Report
│   │   ├── verwaltung/
│   │   │   ├── auftraggeber/page.tsx        # Auftraggeber CRUD
│   │   │   ├── projekte/page.tsx            # Projekte CRUD
│   │   │   ├── aufgabenbereiche/page.tsx    # Aufgabenbereiche CRUD
│   │   │   └── ueberstunden/page.tsx        # Überstundenregeln
│   │   ├── papierkorb/page.tsx              # Gelöschte Einträge
│   │   └── api/                             # API Routes
│   ├── components/
│   │   ├── ui/                              # shadcn/ui
│   │   ├── timer/                           # Timer + TimerContext
│   │   ├── time-entry/                      # Formular + Tabelle
│   │   ├── reports/                         # Report-Komponenten
│   │   ├── layout/                          # Sidebar, Header
│   │   └── shared/                          # Dropdowns (Client, Projekt, etc.)
│   ├── lib/
│   │   ├── db.ts                            # Prisma Client Singleton
│   │   ├── time-utils.ts                    # Dauer-Berechnung, Formatierung
│   │   ├── overtime.ts                      # Überstunden-Logik
│   │   ├── report-queries.ts                # Aggregations-Queries
│   │   └── export/                          # PDF + CSV Export
│   └── types/
│       └── index.ts
├── PLAN.md
└── package.json
```

---

## Phasen

### Phase 1: Projekt-Setup + Datenmodell
**Ziel:** App startet, DB ist erstellt, Navigation funktioniert.

- [ ] Next.js Projekt initialisieren (TypeScript, Tailwind, App Router)
- [ ] Prisma installieren + Schema erstellen (SQLite)
- [ ] Migration ausführen
- [ ] Seed-Script: Standard-Aufgabenbereiche + Beispiel-Auftraggeber/Projekte aus Excel
- [ ] shadcn/ui einrichten + Basis-Komponenten installieren
- [ ] Layout mit Sidebar-Navigation
- [ ] Platzhalter-Seiten für alle Routes

---

### Phase 2: Zeiterfassung (Kernfunktion)
**Ziel:** Timer funktioniert, manuelle Eingabe möglich, Einträge werden in DB gespeichert und angezeigt.

- [ ] **Timer-Komponente** mit Start/Pause/Stop
  - React Context für globalen Timer-State
  - localStorage-Persistenz (überlebt Page Reload)
  - Absolute Timestamps (wie Excel SystemWichtig-Sheet)
- [ ] **Manuelles Eingabeformular**
  - Datum, Start, Ende (Dauer wird automatisch berechnet)
  - Dropdowns: Auftraggeber → Projekt (kaskadierend), Aufgabengebiet
  - Tätigkeit (Freitext), Notizen
- [ ] **API Routes** für TimeEntries (CRUD + Soft Delete)
- [ ] **Einträge-Tabelle** mit Sortierung, Inline-Edit, Löschen
- [ ] **Zeiterfassungs-Seite**: Timer oben, Formular darunter, heutige Einträge unten
- [ ] **Hilfsfunktionen**: Dauer-Berechnung, Formatierung (hh:mm)

---

### Phase 3: Dashboard + Verwaltung
**Ziel:** Dashboard zeigt Tagesübersicht. Auftraggeber, Projekte, Aufgabenbereiche und Überstundenregeln sind verwaltbar.

- [ ] **Dashboard**
  - Heute gearbeitet (Gesamtstunden)
  - Laufender Timer-Indikator
  - Wochenübersicht nach Projekt
  - Monatsübersicht nach Auftraggeber
  - Quick-Start Buttons
- [ ] **CRUD-Seiten**: Auftraggeber, Projekte, Aufgabenbereiche
- [ ] **Überstundenregeln** (analog Excel "Listen" Spalten E-I)
  - Neue Regeln hinzufügen (nie editieren, wie in Excel)
  - Aktive vs. abgelaufene Regeln anzeigen
- [ ] **Papierkorb**: Gelöschte Einträge anzeigen, wiederherstellen, endgültig löschen

---

### Phase 4: Reports
**Ziel:** Alle vier Report-Typen funktionieren mit Datumsfilter und Überstunden-Berechnung.

- [ ] **Report-Query-Engine** (`report-queries.ts`)
  - Tagesreport: Einträge gruppiert nach Tag, Summen
  - Monatsreport: Tagesübersicht, Soll/Ist, Überstunden-Saldo
  - Auftraggeber-Report: Stunden pro Auftraggeber/Projekt, frei wählbarer Zeitraum
  - Projekt-Report: Stunden pro Aufgabengebiet
- [ ] **Überstunden-Berechnung** (`overtime.ts`)
  - Gültige Regel für Datum finden (gueltigAb/gueltigBis)
  - Ist-Stunden - Soll-Stunden = Überstunden
  - Nur wenn ueberstundenAktiv = true
- [ ] **Report-Seiten** mit Datumsfilter und DateRangePicker
  - Presets: Heute, Diese Woche, Dieser Monat, Letzter Monat, Benutzerdefiniert
- [ ] **Visualisierungen** mit Recharts (Balkendiagramme, Kalender-Heatmap)

---

### Phase 5: Export + Feinschliff
**Ziel:** PDF/CSV-Export funktioniert. App ist responsive und poliert.

- [ ] **CSV-Export** (Papa Parse) — deutsche Spaltenüberschriften
- [ ] **PDF-Export** (jsPDF) — gebrandetes Layout mit Tabellen
- [ ] Export-Buttons auf jeder Report-Seite
- [ ] **UI-Polish**
  - Responsive Design (mobile-tauglich)
  - Loading States, Skeleton Screens
  - Toast-Benachrichtigungen
  - Keyboard Shortcuts (Ctrl+Enter für Timer)
  - Dark Mode
  - Deutsche Datumsformate (date-fns/locale/de)
- [ ] **Validierung** mit Zod-Schemas
- [ ] **Performance**: DB-Indizes, Pagination

---

## Bekannte Herausforderungen

| Thema | Lösung |
|---|---|
| Timer-Genauigkeit bei Page Reload | Absoluten Timestamp in localStorage speichern, nicht verstrichene Zeit |
| Überstunden-Regelwechsel | Query: `gueltigAb <= datum AND (gueltigBis IS NULL OR gueltigBis >= datum)`, bei Mehrfachtreffern neueste Regel nehmen |
| SQLite auf Vercel | Für Produktion: Turso (SQLite-Cloud) oder Prisma auf PostgreSQL/Supabase umstellen (1-Zeilen-Änderung) |
| Dauer-Präzision | Ganzzahl in Sekunden statt Fließkomma (Excel speichert als Bruchteil eines Tages) |
| Auftraggeber fehlt in Excel | Standard-Auftraggeber im Seed erstellen, Projekte zuordnen |

---

## Abhängigkeiten (package.json)

```
dependencies:
  next, react, react-dom
  @prisma/client
  tailwindcss
  date-fns
  zod
  jspdf, jspdf-autotable
  papaparse
  recharts
  lucide-react

devDependencies:
  prisma
  typescript, @types/react, @types/node
  eslint, eslint-config-next
```
