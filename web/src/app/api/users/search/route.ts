import { searchUsers } from "@/features/users/service";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  if (q.length > 50) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  const results = await searchUsers(q, user.id);
  return NextResponse.json({ results });
}
