import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImportWizard } from "./ImportWizard";

export const metadata = {
  title: "Import from Letterboxd",
  description:
    "Move your watch history, ratings, reviews, and watchlist from Letterboxd in a few clicks.",
};

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/import");
  }

  return (
    <main className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-b from-zinc-900 to-transparent px-4 py-8 text-center">
        <div className="mx-auto max-w-xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Letterboxd Import
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Move your movie life here
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Import your entire Letterboxd history — watched films, ratings, reviews, and watchlist
            — in just a few steps.
          </p>
        </div>
      </div>
      <ImportWizard />
    </main>
  );
}
