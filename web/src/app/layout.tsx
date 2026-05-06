import { SiteHeader } from "@/components/layout/SiteHeader";
import { APP_NAME } from "@/config/brand";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: `${APP_NAME} — quick picks & your watch log`,
  description:
    `${APP_NAME}: strict genre-aware suggestions from TMDb, plus watchlist and watched history in Supabase.`,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#09090b" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Toaster
          position="bottom-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(24, 24, 32, 0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f1f1f3",
              backdropFilter: "blur(16px)",
              borderRadius: "12px",
              fontSize: "13px",
              padding: "12px 16px",
            },
            className: "shadow-2xl shadow-black/50",
          }}
        />
        <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-zinc-600">
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
