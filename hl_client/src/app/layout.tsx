// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Josefin_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const josefinSans = Josefin_Sans({ variable: "--font-josefin-sans", subsets: ["latin"], weight: "600" });

export const metadata: Metadata = {
  title: "Dreamway Holding Ltd",
  description: "TO THE DESTINATION OF DREAMS",
  verification: { google: 'xyO5HfjrQK-bvFB7IKSb_sQ3B4Cjut99_qj4d82Ufpw' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Safe: ignore browser extensions */}
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${josefinSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}