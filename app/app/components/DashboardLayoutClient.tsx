"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Terminal } from "lucide-react";
import SidebarNav from "./SidebarNav";

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="h-full flex bg-background text-text overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 border-b border-white/10 bg-surface/80 backdrop-blur-md flex items-center justify-between px-4 z-40">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand">Rello</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-text hover:bg-white/5 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 flex-shrink-0 border-r border-white/10 bg-surface flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 group perspective">
            <span className="text-xl font-bold text-brand transition-all duration-300 group-hover:scale-105">
              Rello
            </span>
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              Platform
            </span>
          </Link>
          <button 
            className="md:hidden p-1 text-text-muted hover:bg-white/5 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarNav />
        <div className="p-4 border-t border-white/10">
          <Link
            href="/developers"
            className="flex items-center gap-3 text-text-muted text-sm px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-text font-mono transition-colors"
          >
            <Terminal className="w-5 h-5 opacity-80" strokeWidth={2} />
            API Docs
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-background pt-16 md:pt-0">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
