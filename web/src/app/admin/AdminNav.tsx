"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", icon: "◈" },
  { href: "/admin/users", label: "Users", icon: "◉" },
  { href: "/admin/analytics", label: "Analytics", icon: "◇" },
  { href: "/admin/feedback", label: "Feedback", icon: "◎" },
  { href: "/admin/logs", label: "Audit Logs", icon: "◑" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="space-y-0.5">
      {NAV.map(({ href, label, icon }) => {
        const active = path === href || (href !== "/admin" && path.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-indigo-500/15 text-indigo-300"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
