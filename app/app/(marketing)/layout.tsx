export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <nav className="border-b border-white/10 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <a href="/" className="flex items-center gap-2 group perspective">
              <span className="text-xl font-bold text-brand transition-all duration-300 group-hover:scale-105">
                Rello
              </span>
              <span className="hidden sm:inline text-xs text-text-muted font-mono transition-colors duration-200 group-hover:text-text">
                market integrity
              </span>
            </a>
            <div className="flex items-center gap-1 perspective overflow-x-auto no-scrollbar">
              <a href="/dashboard" className="text-text-muted text-sm px-3 py-1.5 rounded-md hover:bg-white/5 whitespace-nowrap">Dashboard</a>
              <a href="/trade" className="text-text-muted text-sm px-3 py-1.5 rounded-md hover:bg-white/5 whitespace-nowrap hidden sm:inline-block">Trade</a>
              <a href="/compare" className="text-text-muted text-sm px-3 py-1.5 rounded-md hover:bg-white/5 whitespace-nowrap hidden sm:inline-block">Feeds</a>
              <a href="/activity" className="text-text-muted text-sm px-3 py-1.5 rounded-md hover:bg-white/5 whitespace-nowrap hidden sm:inline-block">Activity</a>
              <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
              <a href="/developers" className="text-text-muted text-xs px-2 py-1.5 rounded-md hover:bg-white/5 font-mono whitespace-nowrap hidden sm:inline-block">API</a>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}