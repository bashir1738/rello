import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-space-grotesk", // keeping variable name so we don't have to change tailwind.config
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
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230071e3'/><text y='72' x='50' text-anchor='middle' font-size='56' font-family='monospace' font-weight='bold' fill='white'>R</text></svg>",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-background text-text">
        {children}
      </body>
    </html>
  );
}
