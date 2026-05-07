import { HomeLanding } from "@/components/landing/HomeLanding";
import { redirect } from "next/navigation";

/** Supabase may send PKCE confirm links to Site URL (?code=) if redirect mismatch — forward into callback */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const code = typeof params.code === "string" ? params.code : undefined;
  if (code) {
    const pairs: [string, string][] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) pairs.push([key, v]);
      } else pairs.push([key, value]);
    }
    const sp = new URLSearchParams(pairs);
    if (!sp.has("post_verify")) sp.set("post_verify", "login");
    redirect(`/auth/callback?${sp.toString()}`);
  }

  return <HomeLanding />;
}
