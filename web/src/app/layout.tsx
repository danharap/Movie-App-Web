import { SiteHeader } from "@/components/layout/SiteHeader";
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
  title: "Tonight — mood-led movie picks",
  description:
    "A calmer way to choose a film: mood-led shortlists from TMDb, watchlist and watched log in Supabase — built for Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-600">
          Data provided by{" "}
          <a
            href="https://www.themoviedb.org/"
            className="text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline"
          >
            TMDb
          </a>
          . Not endorsed or certified by TMDb.
        </footer>
      </body>
    </html>
  );
}
