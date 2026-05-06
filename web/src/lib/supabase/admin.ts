/**
 * Service-role Supabase client — SERVER ONLY.
 * Never import this in client components or expose the key to the browser.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in your environment.
 * Add it to .env.local:
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
 * Get it from: Supabase Dashboard → Project Settings → API → service_role key
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
