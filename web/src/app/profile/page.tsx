import { saveProfileFromForm } from "@/app/profile/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: prefs } = user
    ? await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Preferences</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Defaults for your next session — you can still override them on each run.
      </p>

      {!user ? (
        <p className="mt-8 text-sm text-zinc-500">
          Sign in to save preferences to your account.
        </p>
      ) : (
        <form className="mt-10 space-y-6" action={saveProfileFromForm}>
          <div className="space-y-2">
            <label htmlFor="default_runtime_min" className="text-sm text-zinc-300">
              Default min runtime (minutes)
            </label>
            <input
              id="default_runtime_min"
              name="default_runtime_min"
              type="number"
              defaultValue={prefs?.default_runtime_min ?? ""}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="default_runtime_max" className="text-sm text-zinc-300">
              Default max runtime (minutes)
            </label>
            <input
              id="default_runtime_max"
              name="default_runtime_max"
              type="number"
              defaultValue={prefs?.default_runtime_max ?? ""}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-amber-200/90 px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
          >
            Save preferences
          </button>
        </form>
      )}
    </div>
  );
}
