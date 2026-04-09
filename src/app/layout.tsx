import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { TimerProvider } from "@/components/timer/TimerContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mimi - Zeiterfassung",
  description: "Zeiterfassung für Auftraggeber und Projekte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full bg-gray-50">
        <TimerProvider>
          <Sidebar />
          <main className="md:ml-64 p-6 pt-16 md:pt-6">{children}</main>
        </TimerProvider>
      </body>
    </html>
  );
}
