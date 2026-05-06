import { UserSearch } from "./UserSearch";
import { FriendButton } from "@/components/social/FriendButton";
import { Avatar } from "@/components/ui/Avatar";
import { getFriends, getPendingRequests } from "@/features/users/service";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/friends");

  const [friends, pending] = await Promise.all([
    getFriends(user.id),
    getPendingRequests(user.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <header className="mb-8 space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/70">
          Social
        </p>
        <h1 className="text-3xl font-semibold text-white">Friends</h1>
      </header>

      {/* Pending requests */}
      {pending.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            Friend Requests
            <span className="rounded-full bg-amber-200/20 px-2 py-0.5 text-xs text-amber-200/90">
              {pending.length}
            </span>
          </h2>
          <ul className="space-y-2">
            {pending.map((p) => {
              const name = p.display_name?.trim() || p.username || "User";
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-amber-200/15 bg-zinc-900/40 p-3"
                >
                  <Link href={`/user/${p.username ?? p.id}`}>
                    <Avatar url={p.avatar_url} name={name} size={40} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/user/${p.username ?? p.id}`}
                      className="block truncate text-sm font-medium text-white hover:text-amber-100"
                    >
                      {name}
                    </Link>
                    {p.username ? (
                      <p className="text-xs text-zinc-500">@{p.username}</p>
                    ) : null}
                  </div>
                  <FriendButton
                    targetId={p.requesterId}
                    initial="pending_received"
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Search */}
      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-white">
          Find People
        </h2>
        <UserSearch />
      </section>

      {/* Friends list */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-white">
          Your Friends ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-6 py-12 text-center">
            <p className="text-sm text-zinc-400">
              No friends yet — search for people above.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {friends.map((f) => {
              const name = f.display_name?.trim() || f.username || "User";
              return (
                <li
                  key={f.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/40 p-3"
                >
                  <Link href={`/user/${f.username ?? f.id}`}>
                    <Avatar url={f.avatar_url} name={name} size={40} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/user/${f.username ?? f.id}`}
                      className="block truncate text-sm font-medium text-white hover:text-amber-100"
                    >
                      {name}
                    </Link>
                    {f.username ? (
                      <p className="text-xs text-zinc-500">@{f.username}</p>
                    ) : null}
                    {f.bio ? (
                      <p className="line-clamp-1 text-xs text-zinc-500">
                        {f.bio}
                      </p>
                    ) : null}
                  </div>
                  <FriendButton targetId={f.id} initial="accepted" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
