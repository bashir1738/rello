"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowRightLeft, Activity, Droplets, Rocket, ClipboardList } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trade", label: "Trade", icon: ArrowRightLeft },
  { href: "/compare", label: "Feeds", icon: Activity },
  { href: "/pools", label: "Pools", icon: Droplets },
  { href: "/pre-ipo", label: "Pre-IPO", icon: Rocket },
  { href: "/activity", label: "Activity", icon: ClipboardList },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl transition-colors ${
              isActive
                ? "bg-white/5 text-text font-medium"
                : "text-text-muted hover:bg-white/5 hover:text-text"
            }`}
          >
            <Icon className="w-5 h-5 opacity-80" strokeWidth={2} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
