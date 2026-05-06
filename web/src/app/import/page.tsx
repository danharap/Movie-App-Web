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
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-300">
            <span>🎬</span> Letterboxd Import
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
