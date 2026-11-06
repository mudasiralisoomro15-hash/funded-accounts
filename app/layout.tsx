import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "FundedX — Trade Firm Capital. Keep Up To 100% Of The Profits.",
  description:
    "Get funded with Instant Flex, Instant Lite, 1-Step and 2-Step accounts. Up to 100% profit split, EAs allowed, no consistency rule and fast crypto & bank payouts.",
};

export const viewport: Viewport = {
  themeColor: "#0B0F17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
