import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Credits } from "@/components/Credits";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MAVER Sedra - RSVP Torah Reader",
  description: "Read the weekly Torah portion (Parashat HaShavua) using Rapid Serial Visual Presentation (RSVP) technology. Read Hebrew text 3-5x faster.",
  keywords: ["Torah", "Parsha", "RSVP", "Hebrew", "Jewish", "Sedra", "Reading"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        {children}
        <Credits />
      </body>
    </html>
  );
}
