import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthExpiredModal from "@/src/components/authExpiredModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LowMark | Smart Price Tracker",
    template: "%s | LowMark",
  },
  description:
    "Track product prices, monitor price drops, view price history, and get notified when it's the right time to buy with LowMark.",
  applicationName: "LowMark",
  keywords: [
    "LowMark",
    "price tracker",
    "price drop alerts",
    "product price history",
    "smart shopping",
    "price monitoring",
  ],
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <AuthExpiredModal />
      </body>
    </html>
  );
}
