import { AdminNav } from "./AdminNav";
import { AdminStoreProvider } from "./AdminStoreProvider";
import { getSessionWithRole } from "@/lib/admin/rbac";
import { APP_NAME } from "@/config/brand";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionWithRole();

  // Gate: must be signed in + admin/super_admin
  if (!session) redirect("/login?redirect=/admin");
  if (session.role !== "admin" && session.role !== "super_admin") {
    // Return 403 page rather than a redirect loop
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
        <div className="max-w-md text-center">
          <p className="text-5xl font-bold text-red-400">403</p>
          <h1 className="mt-4 text-2xl font-semibold text-white">Access Denied</h1>
          <p className="mt-2 text-sm text-zinc-400">
            You do not have permission to access the admin dashboard.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-indigo-500 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Back to app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminStoreProvider>
      <div className="flex min-h-screen bg-zinc-950">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/8 bg-zinc-900/60 lg:flex">
          <div className="flex h-14 items-center gap-2 border-b border-white/8 px-4">
            <span className="text-sm font-bold text-indigo-300">{APP_NAME}</span>
            <span className="ml-auto rounded-full bg-red-900/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-300">
              Admin
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-6 p-3 pt-4">
            <AdminNav />
          </div>
          <div className="border-t border-white/8 p-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ← Back to app
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar */}
          <div className="flex h-14 items-center justify-between border-b border-white/8 bg-zinc-900/60 px-4 lg:hidden">
            <span className="text-sm font-bold text-indigo-300">{APP_NAME} Admin</span>
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
              ← App
            </Link>
          </div>
          {/* Mobile nav */}
          <div className="flex gap-1 overflow-x-auto border-b border-white/8 bg-zinc-900/40 px-3 py-2 lg:hidden">
            {[
              { href: "/admin", label: "Overview" },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/analytics", label: "Analytics" },
              { href: "/admin/feedback", label: "Feedback" },
              { href: "/admin/logs", label: "Logs" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminStoreProvider>
  );
}
