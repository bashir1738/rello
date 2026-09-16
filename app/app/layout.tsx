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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text">
        <nav className="border-b border-white/10 bg-surface sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <a href="/" className="flex items-center gap-2 group">
                <span className="text-xl font-bold text-brand transition-transform duration-300 group-hover:scale-105">
                  Rello
                </span>
                <span className="hidden sm:inline text-xs text-text-muted font-mono">
                  market integrity
                </span>
              </a>
              <div className="flex items-center gap-6 text-sm perspective">
                <a
                  href="/dashboard"
                  className="nav-link-3d text-text-muted"
                >
                  Dashboard
                </a>
                <a
                  href="/activity"
                  className="nav-link-3d text-text-muted"
                >
                  Activity
                </a>
                <a
                  href="/developers"
                  className="nav-link-3d text-text-muted"
                >
                  Developers
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
