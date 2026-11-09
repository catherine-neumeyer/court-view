import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import LiveRefresh from "@/components/LiveRefresh";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intervarsity TCD",
  description: "Live scores and schedule for Intervarsity TCD",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-stone-200 text-stone-900">
        <div className="mx-auto min-h-screen w-full max-w-md bg-stone-100 pb-16 md:max-w-4xl">
          {children}
        </div>
        <Suspense fallback={null}>
          <LiveRefresh />
        </Suspense>
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}
