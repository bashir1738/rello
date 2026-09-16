import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rello — Market Integrity for Tokenized Equities",
  description:
    "Automated market-integrity infrastructure for tokenized equities on Solana. Real-time drift detection, autonomous correction, on-chain guard rails.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%236C5DFF'/><text y='72' x='50' text-anchor='middle' font-size='56' font-family='monospace' font-weight='bold' fill='white'>R</text></svg>",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text">
        <nav className="border-b border-white/10 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <a href="/" className="flex items-center gap-2 group perspective">
                <span className="text-xl font-bold text-brand text-glow-brand transition-all duration-300 group-hover:scale-110 group-hover:rotate-y-3">
                  Rello
                </span>
                <span className="hidden sm:inline text-xs text-text-muted font-mono transition-colors duration-200 group-hover:text-text">
                  market integrity
                </span>
              </a>
              <div className="flex items-center gap-1 perspective">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/compare", label: "Feeds" },
                  { href: "/trade", label: "Trade" },
                  { href: "/pools", label: "Pools" },
                  { href: "/pre-ipo", label: "Pre-IPO" },
                  { href: "/activity", label: "Activity" },
                  { href: "/developers", label: "API" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="nav-link-3d text-text-muted text-sm px-3 py-1.5 rounded-md hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
