/**
 * Role-Based Access Control helpers — SERVER ONLY.
 * Always call these from server components, server actions, or API routes.
 * Never rely on client-side role checks for authorization.
 */
import { createClient } from "@/lib/supabase/server";

export type Role = "user" | "moderator" | "admin" | "super_admin";
export type UserStatus = "active" | "suspended" | "banned";

const ROLE_RANK: Record<Role, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3,
};

export function roleAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/** Returns the authenticated user + their role, or null if not signed in. */
export async function getSessionWithRole(): Promise<{
  userId: string;
  role: Role;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    role: (data?.role as Role | null) ?? "user",
  };
}

/**
 * Guards a server action or page loader.
 * Throws if the current user's role is below `minimum`.
 */
export async function requireRole(minimum: Role): Promise<{
  userId: string;
  role: Role;
}> {
  const session = await getSessionWithRole();
  if (!session) throw new Error("UNAUTHORIZED");
  if (!roleAtLeast(session.role, minimum)) throw new Error("FORBIDDEN");
  return session;
}

/** Convenience: require admin or super_admin */
export async function requireAdmin() {
  return requireRole("admin");
}

/** Convenience: require super_admin only */
export async function requireSuperAdmin() {
  return requireRole("super_admin");
}
