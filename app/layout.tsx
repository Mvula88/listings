import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/providers/toast-provider";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DealDirect - Commission-Free Real Estate",
  description: "Buy and sell properties directly without agent commissions. Save thousands with DealDirect.",
  keywords: "real estate, property, buy, sell, commission-free, no agent fees, direct sale, Namibia, South Africa",
  authors: [{ name: "DealDirect" }],
  openGraph: {
    title: "DealDirect - Commission-Free Real Estate",
    description: "Buy and sell properties directly without agent commissions. Save thousands with DealDirect.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DealDirect - Commission-Free Real Estate",
    description: "Buy and sell properties directly without agent commissions. Save thousands with DealDirect.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <ToastProvider>
          {children}
        </ToastProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
