"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/directory", label: "Candidate Directory" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border-blue-500 text-white"
                  : "border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
