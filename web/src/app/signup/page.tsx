import { signUpWithEmail } from "@/app/actions/auth";
import Link from "next/link";

type Props = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const q = await searchParams;
  const err = q.error ? decodeURIComponent(q.error) : null;

  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      <h1 className="text-2xl font-semibold text-white">Sign up</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-amber-200 hover:text-amber-100">
          Log in
        </Link>
      </p>
      {q.message === "check_email" ? (
        <p className="mt-4 rounded-lg border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-sm text-amber-100">
          Check your inbox to confirm your email, then come back to log in.
        </p>
      ) : null}
      {err ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </p>
      ) : null}
      <form action={signUpWithEmail} className="mt-8 space-y-4">
        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm text-zinc-400">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-zinc-400">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-zinc-400">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-amber-200/90 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
