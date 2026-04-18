import { markSeenFromForm, queueFilmFromForm } from "@/app/movie/actions";
import { getMovieDetails } from "@/lib/tmdb/client";
import { posterUrl } from "@/lib/tmdb/constants";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ tmdbId: string }> };

export default async function MovieDetailPage({ params }: Props) {
  const { tmdbId: raw } = await params;
  const tmdbId = Number(raw);
  if (!Number.isFinite(tmdbId)) notFound();

  let movie;
  try {
    movie = await getMovieDetails(tmdbId);
  } catch {
    notFound();
  }

  const backdrop = posterUrl(movie.backdrop_path, "original");
  const poster = posterUrl(movie.poster_path, "w500");

  return (
    <article>
      <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-96">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
            aria-hidden
          />
        ) : (
          <div className="h-full bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/80 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="-mt-24 flex flex-col gap-6 md:flex-row md:items-end">
          <div className="relative mx-auto aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl md:mx-0 md:w-52">
            {poster ? (
              <Image
                src={poster}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="208px"
              />
            ) : null}
          </div>
          <div className="flex-1 space-y-3 text-center md:pb-2 md:text-left">
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              {movie.title}
            </h1>
            <p className="text-sm text-zinc-400">
              {movie.release_date?.slice(0, 4)} · ★{" "}
              {movie.vote_average?.toFixed(1)} · {movie.runtime ?? "—"} min
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
          {movie.overview || "No synopsis available."}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3 md:justify-start">
          <form action={markSeenFromForm}>
            <input type="hidden" name="tmdbId" value={tmdbId} />
            <button
              type="submit"
              className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15"
            >
              Mark watched
            </button>
          </form>
          <form action={queueFilmFromForm}>
            <input type="hidden" name="tmdbId" value={tmdbId} />
            <button
              type="submit"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:border-amber-200/40 hover:text-white"
            >
              Add to watchlist
            </button>
          </form>
          <Link
            href="/recommend"
            className="rounded-full px-5 py-2.5 text-sm text-zinc-500 hover:text-zinc-300"
          >
            Find similar
          </Link>
        </div>
      </div>
    </article>
  );
}
