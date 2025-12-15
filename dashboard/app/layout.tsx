import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/landing/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Umrah Trip Companion - Calm, unified group management",
  description: "Plan, guide, and support every traveler from preparation to return, all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
