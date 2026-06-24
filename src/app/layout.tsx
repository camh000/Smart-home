import type { Metadata } from "next";
import { Fraunces, Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Base for resolving relative OG/canonical URLs. On Vercel this is the
  // production domain; falls back to localhost in dev so builds don't warn.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "Smart Home — Woodhouse Road",
  description:
    "A bespoke, self-hosted replacement for Alexa — voice control, lighting, locks, blinds and CCTV, with Claude wired into Home Assistant. The full project plan, integration design, floorplan, cost calculator and shopping list.",
  openGraph: {
    title: "Smart Home — Woodhouse Road",
    description:
      "The full plan for a Claude-powered, Home-Assistant-orchestrated smart home: voice, lighting, locks, blinds, CCTV, presence and proactive automation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${publicSans.variable} ${jetbrains.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
