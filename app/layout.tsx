import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Candidature Tracker",
  description: "Track job applications, KPIs and follow-ups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-navy shadow-sm">
          <nav className="mx-auto flex max-w-6xl items-center gap-8 px-4 py-4">
            <Link
              href="/"
              className="text-lg font-bold tracking-wide text-white"
            >
              SUIVI DE MES CANDIDATURES
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-blue-100 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/new"
              className="text-sm font-medium text-blue-100 hover:text-white"
            >
              + New application
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
