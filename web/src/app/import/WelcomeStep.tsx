"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Film, Star, BookOpen, List, Heart, Download } from "lucide-react";

interface WelcomeStepProps {
  onContinue: () => void;
}

const slides = [
  {
    id: "what",
    icon: <Film className="h-8 w-8 text-amber-300" />,
    title: "Bring your movie history with you",
    body: (
      <p className="text-zinc-300 leading-relaxed">
        Letterboxd lets you export all of your data — every film you&apos;ve watched, every rating,
        every review, and your whole watchlist — as a ZIP file. This importer reads that export
        and moves everything into your account here, so your movie identity travels with you.
      </p>
    ),
  },
  {
    id: "how-to-export",
    icon: <Download className="h-8 w-8 text-amber-300" />,
    title: "How to export your Letterboxd data",
    body: (
      <ol className="space-y-3 text-zinc-300">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/20 text-xs font-bold text-amber-300">
            1
          </span>
          <span>
            Go to{" "}
            <strong className="text-white">letterboxd.com</strong> and sign in.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/20 text-xs font-bold text-amber-300">
            2
          </span>
          <span>
            Click your avatar → <strong className="text-white">Settings</strong>.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/20 text-xs font-bold text-amber-300">
            3
          </span>
          <span>
            In the left sidebar choose <strong className="text-white">Import &amp; Export</strong>.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/20 text-xs font-bold text-amber-300">
            4
          </span>
          <span>
            Scroll to <strong className="text-white">Export Your Data</strong> and click{" "}
            <strong className="text-white">Export</strong>. Letterboxd will email you a download
            link within a few minutes.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/20 text-xs font-bold text-amber-300">
            5
          </span>
          <span>
            Download the <strong className="text-white">.zip</strong> file — you can upload it
            directly on the next screen. No need to unzip.
          </span>
        </li>
      </ol>
    ),
  },
  {
    id: "what-imports",
    icon: <List className="h-8 w-8 text-amber-300" />,
    title: "What gets imported",
    body: (
      <div className="space-y-3">
        {[
          {
            icon: <Film className="h-4 w-4 text-amber-300" />,
            label: "Watch history",
            desc: "Every film you marked as watched, with the date you watched it.",
          },
          {
            icon: <Star className="h-4 w-4 text-amber-300" />,
            label: "Ratings",
            desc: "Half-star ratings (0.5–5.0) are preserved exactly.",
          },
          {
            icon: <BookOpen className="h-4 w-4 text-amber-300" />,
            label: "Reviews & notes",
            desc: "Your written reviews come across as notes on each film.",
          },
          {
            icon: <List className="h-4 w-4 text-amber-300" />,
            label: "Watchlist",
            desc: "Films you wanted to see are added to your watchlist here.",
          },
          {
            icon: <Heart className="h-4 w-4 text-amber-300" />,
            label: "Liked films",
            desc: "Shown in your import summary — great for setting favourites.",
          },
        ].map((item) => (
          <div key={item.label} className="flex gap-3 rounded-lg bg-white/5 p-3">
            <div className="mt-0.5 shrink-0">{item.icon}</div>
            <div>
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="text-xs text-zinc-400">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "matching",
    icon: <Star className="h-8 w-8 text-amber-300" />,
    title: "How movie matching works",
    body: (
      <div className="space-y-4 text-zinc-300">
        <p className="leading-relaxed">
          Letterboxd identifies films by title and year. We use that to search TMDB (The Movie
          Database) and find the matching entry for each film.
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-lg bg-green-500/10 p-3 text-sm">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-400" />
            <span>
              <strong className="text-green-300">Exact match</strong> — title and year align
              perfectly. These are imported automatically.
            </span>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            <span>
              <strong className="text-amber-300">Close match</strong> — title matches but year
              is off by one (common with international releases). You&apos;ll confirm these.
            </span>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
            <span>
              <strong className="text-red-300">No match</strong> — we couldn&apos;t find it
              automatically. You can pick from candidates or skip.
            </span>
          </div>
        </div>
        <p className="text-sm text-zinc-500">
          Most libraries import with &gt;95% automatic matches. The confirmation step only shows
          the films that need your help.
        </p>
      </div>
    ),
  },
];

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  const [slide, setSlide] = useState(0);
  const current = slides[slide];
  const isLast = slide === slides.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSlide(i)}
            className={`h-2 rounded-full transition-all ${
              i === slide ? "w-6 bg-amber-300" : "w-2 bg-white/20 hover:bg-white/30"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
        <div className="mb-5 flex justify-center">{current.icon}</div>
        <h2 className="mb-4 text-center text-xl font-semibold text-white sm:text-2xl">
          {current.title}
        </h2>
        <div>{current.body}</div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setSlide((s) => Math.max(0, s - 1))}
          disabled={slide === 0}
          className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:text-white disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {isLast ? (
          <button
            onClick={onContinue}
            className="flex-1 rounded-full bg-amber-200/90 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 sm:flex-none"
          >
            Start import →
          </button>
        ) : (
          <button
            onClick={() => setSlide((s) => Math.min(slides.length - 1, s + 1))}
            className="flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Skip tutorial */}
      <button
        onClick={onContinue}
        className="text-center text-xs text-zinc-600 hover:text-zinc-400 transition"
      >
        Skip tutorial and upload files
      </button>
    </div>
  );
}
