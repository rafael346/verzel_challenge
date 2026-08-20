// src/app/layout.tsx
import type { Metadata } from "next";
import { Fraunces, Work_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventTix",
  description: "Plataforma de eventos e ingressos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${workSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-sans">
        <AuthProvider>
          <Navbar />
          <main className="max-w-5xl mx-auto p-4 w-full">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
