import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-kannada/400.css";
import "@fontsource/noto-sans-kannada/600.css";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "@fontsource/noto-sans-tamil/400.css";
import "./globals.css";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: `${site.product}: AI agents that help small factories buy right and quote right`,
  description: site.oneLiner,
  openGraph: {
    title: `${site.product} · Tech4Bharat 2026 · Problem 4.1`,
    description: site.oneLiner,
    url: site.siteUrl,
    siteName: site.product,
    type: "website",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: site.product, description: site.oneLiner },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10213f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-paper focus:px-3 focus:py-2">
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
