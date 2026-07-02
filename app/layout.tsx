import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NavLinks } from "@/app/components/NavLinks";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Candidature Tracker",
  description: "Track job applications, KPIs and follow-ups",
};

function LogoMark() {
  return (
    <div className="flex items-center gap-3 px-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-navy-light to-navy text-sm font-black text-white ring-1 ring-white/20">
        CT
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold tracking-wide text-white">
          CANDIDATURES
        </div>
        <div className="text-[11px] font-medium uppercase tracking-widest text-blue-200/60">
          Suivi &amp; KPIs
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen bg-surface text-gray-900">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-6 bg-gradient-to-b from-navy-ink via-navy-deep to-navy py-6 lg:flex">
          <LogoMark />
          <NavLinks orientation="side" />
          <div className="mt-auto px-6">
            <div className="rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-blue-100/50 ring-1 ring-white/10">
              Paste a job posting or a LinkedIn confirmation email on{" "}
              <span className="font-semibold text-blue-100/80">
                New application
              </span>{" "}
              — fields fill themselves.
            </div>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-gradient-to-r from-navy-ink to-navy px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-black text-white">
              CT
            </div>
            <span className="text-sm font-bold tracking-wide text-white">
              CANDIDATURES
            </span>
          </div>
          <NavLinks orientation="top" />
        </header>

        <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-60 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
