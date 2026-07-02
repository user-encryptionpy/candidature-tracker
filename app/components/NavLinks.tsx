"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/new",
    label: "New application",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function NavLinks({ orientation }: { orientation: "side" | "top" }) {
  const pathname = usePathname();

  if (orientation === "top") {
    return (
      <div className="flex items-center gap-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === l.href
                ? "bg-white/15 text-white"
                : "text-blue-100/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {l.icon}
            <span className="hidden sm:inline">{l.label}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-1 px-3">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === l.href
              ? "bg-white/15 text-white shadow-sm"
              : "text-blue-100/70 hover:bg-white/8 hover:text-white"
          }`}
        >
          {l.icon}
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
