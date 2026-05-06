import { getAllFeedback } from "@/app/actions/admin";
import { DeleteFeedbackButton } from "./FeedbackActions";

export const dynamic = "force-dynamic";


export default async function AdminFeedbackPage() {
  const feedback = await getAllFeedback();

  const avg =
    feedback.length > 0
      ? (feedback.reduce((s, f) => s + (f.rating as number), 0) / feedback.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">App Feedback</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {feedback.length} review{feedback.length !== 1 ? "s" : ""}
            {avg && <span className="ml-2 text-indigo-300">{avg}/10 avg</span>}
          </p>
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center">
          <p className="text-sm text-zinc-500">No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((f) => {
            const profile = f.profiles as unknown as { display_name: string | null; username: string | null; email: string | null } | null;
            const name = profile?.display_name ?? profile?.email ?? "Anonymous";
            return (
              <div
                key={f.id}
                className="rounded-2xl border border-white/8 bg-zinc-900/50 p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-zinc-500">
                      @{profile?.username ?? "—"} ·{" "}
                      {new Date(f.created_at as string).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-indigo-300">
                      {f.rating as number}/10
                    </span>
                    <DeleteFeedbackButton id={f.id as number} />
                  </div>
                </div>
                <p className="text-sm text-zinc-300">{f.body as string}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
