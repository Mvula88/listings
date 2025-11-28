import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ToastProvider } from "@/components/providers/toast-provider";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "PropLinka - Direct Property Connections",
  description: "Linking buyers and sellers directly without agent commissions. Save thousands with PropLinka.",
  keywords: "real estate, property, buy, sell, commission-free, no agent fees, direct sale, Namibia, South Africa",
  authors: [{ name: "PropLinka" }],
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "PropLinka - Direct Property Connections",
    description: "Linking buyers and sellers directly without agent commissions. Save thousands with PropLinka.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PropLinka - Direct Property Connections",
    description: "Linking buyers and sellers directly without agent commissions. Save thousands with PropLinka.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`}>
        <GoogleAnalytics />
        <ToastProvider>
          {children}
        </ToastProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
