import { getAuditLogs } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          All role changes and admin actions, most recent first.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center">
          <p className="text-sm text-zinc-500">No audit events recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-white/8 bg-zinc-900/60">
                {["Time", "Actor", "Target", "Change", "Notes"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-xs font-semibold text-zinc-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {new Date(log.created_at as string).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {(log.actor_id as string | null)?.slice(0, 8) ?? "system"}…
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {(log.target_id as string | null)?.slice(0, 8) ?? "—"}…
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-500">
                      {log.old_role ? (
                        <>
                          <span className="text-red-400">{log.old_role as string}</span>
                          {" → "}
                        </>
                      ) : null}
                      <span className="text-green-400">{log.new_role as string}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">
                    {(log.notes as string | null) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
