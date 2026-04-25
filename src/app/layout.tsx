import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subodh Bhyri",
  description: "Software engineer — distributed systems, AI, full-stack. MS CS at University of Florida.",
  openGraph: {
    title: "Subodh Bhyri — Adaptive Brain",
    description: "An interactive neural network visualization of my skills and projects.",
    url: "https://portfolio-rho-sable-6oocy5c571.vercel.app",
    siteName: "Subodh Bhyri",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Subodh Bhyri — Adaptive Brain",
    description: "An interactive neural network visualization of my skills and projects.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}