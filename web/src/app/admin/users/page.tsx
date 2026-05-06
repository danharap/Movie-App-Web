import { getAllUsers } from "@/app/actions/admin";
import { getSessionWithRole } from "@/lib/admin/rbac";
import { UsersTable } from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([
    getAllUsers({ limit: 200 }),
    getSessionWithRole(),
  ]);

  const canChangeRole = session?.role === "super_admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Search, filter, and manage all user accounts.
          {!canChangeRole && (
            <span className="ml-2 text-amber-200/60">
              Role changes require super_admin.
            </span>
          )}
        </p>
      </div>

      <UsersTable
        initialUsers={users as Parameters<typeof UsersTable>[0]["initialUsers"]}
        canChangeRole={canChangeRole}
      />
    </div>
  );
}
