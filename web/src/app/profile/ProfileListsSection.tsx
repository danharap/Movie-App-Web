"use client";

import {
  addMovieToList,
  createProfileList,
  deleteProfileList,
  removeMovieFromList,
  updateProfileList,
} from "@/app/actions/lists";
import { posterUrl } from "@/lib/tmdb/constants";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ListMovie = {
  movie: {
    id: number;
    tmdb_id: number;
    title: string;
    poster_path: string | null;
  };
  position: number;
};

export type ProfileList = {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  is_public: boolean;
  position: number;
  movies: ListMovie[];
};

export type WatchedForPicker = {
  movie: {
    id: number;
    tmdb_id: number;
    title: string;
    poster_path: string | null;
  };
};

// ---------------------------------------------------------------------------
// Emoji picker (simple preset grid)
// ---------------------------------------------------------------------------
const EMOJI_PRESETS = [
  "🎬", "⭐", "🔥", "💀", "😂", "😭", "❤️", "👻", "🎭", "🏆",
  "🌙", "☀️", "🎵", "🤩", "🧠", "🌊", "🎪", "🦁", "🚀", "🕵️",
];

// ---------------------------------------------------------------------------
// Create / Edit list form (inline)
// ---------------------------------------------------------------------------
function ListForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: { name: string; emoji: string; description: string; is_public: boolean };
  onSave: (v: { name: string; emoji: string; description: string; is_public: boolean }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🎬");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? true);
  const [showEmojis, setShowEmojis] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-4">
      {/* Emoji + Name row */}
      <div className="flex gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojis((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-800 text-xl hover:bg-zinc-700"
          >
            {emoji || "🎬"}
          </button>
          {showEmojis && (
            <div className="absolute left-0 top-full z-20 mt-1 grid grid-cols-5 gap-1 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl">
              {EMOJI_PRESETS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setEmoji(e); setShowEmojis(false); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-zinc-700"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List name…"
          maxLength={60}
          className="flex-1 rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
        />
      </div>

      {/* Description */}
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description (optional)"
        maxLength={280}
        rows={2}
        className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
      />

      {/* Privacy toggle */}
      <label className="flex cursor-pointer items-center gap-3">
        <div
          onClick={() => setIsPublic((v) => !v)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            isPublic ? "bg-amber-400" : "bg-zinc-600"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              isPublic ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
        <span className="text-xs text-zinc-400">{isPublic ? "Public" : "Private"}</span>
      </label>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!name.trim() || saving}
          onClick={() => onSave({ name: name.trim(), emoji: emoji || "🎬", description: desc.trim(), is_public: isPublic })}
          className="rounded-full bg-amber-300 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-200 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-zinc-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Movie Picker overlay
// ---------------------------------------------------------------------------
function MoviePicker({
  watched,
  alreadyIn,
  onAdd,
  onClose,
}: {
  watched: WatchedForPicker[];
  alreadyIn: Set<number>;
  onAdd: (movieId: number) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = watched.filter((w) => {
    if (search) {
      return w.movie.title.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          ✕
        </button>
        <h3 className="text-sm font-semibold text-white">Add films to list</h3>
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search watched films…"
          className="ml-auto w-48 rounded-full border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {filtered.map(({ movie }) => {
            const inList = alreadyIn.has(movie.id);
            const poster = posterUrl(movie.poster_path, "w342");
            return (
              <button
                key={movie.id}
                type="button"
                disabled={inList}
                onClick={() => onAdd(movie.id)}
                title={movie.title}
                className={`group relative aspect-[2/3] overflow-hidden rounded-lg transition ${
                  inList ? "opacity-40 cursor-default" : "hover:ring-2 hover:ring-amber-300"
                }`}
              >
                <div className="relative h-full w-full bg-zinc-800">
                  {poster ? (
                    <Image
                      src={poster}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 25vw, 12vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-1">
                      <span className="line-clamp-3 text-center text-[10px] text-zinc-500">
                        {movie.title}
                      </span>
                    </div>
                  )}
                  {inList && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-xs text-zinc-300">Added</span>
                    </div>
                  )}
                  {!inList && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition">
                      <span className="text-2xl opacity-0 group-hover:opacity-100 transition">＋</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-500">No films found.</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single list card
// ---------------------------------------------------------------------------
function ListCard({
  list,
  watched,
  onDelete,
  onUpdate,
  onAddMovie,
  onRemoveMovie,
}: {
  list: ProfileList;
  watched: WatchedForPicker[];
  onDelete: () => void;
  onUpdate: (v: { name: string; emoji: string; description: string; is_public: boolean }) => void;
  onAddMovie: (movieId: number) => void;
  onRemoveMovie: (movieId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inListIds = new Set(list.movies.map((m) => m.movie.id));

  return (
    <>
      <div className="rounded-2xl border border-white/8 bg-zinc-900/40 overflow-hidden">
        {/* List header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex flex-1 items-center gap-2 text-left"
          >
            <span className="text-lg">{list.emoji ?? "🎬"}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{list.name}</p>
              <p className="text-xs text-zinc-500">
                {list.movies.length} film{list.movies.length !== 1 ? "s" : ""}
                {" · "}
                <span className={list.is_public ? "text-zinc-500" : "text-amber-200/50"}>
                  {list.is_public ? "Public" : "Private"}
                </span>
              </p>
            </div>
            <span className={`ml-auto text-zinc-500 transition ${expanded ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>

          {/* Actions */}
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-700 hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${list.name}"? This cannot be undone.`)) onDelete();
              }}
              className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-red-900/50 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="border-t border-white/8 p-4">
            <ListForm
              initial={{ name: list.name, emoji: list.emoji ?? "🎬", description: list.description ?? "", is_public: list.is_public }}
              onSave={(v) => { onUpdate(v); setEditing(false); }}
              onCancel={() => setEditing(false)}
              saving={isPending}
            />
          </div>
        )}

        {/* Movies grid */}
        {expanded && !editing && (
          <div className="border-t border-white/8 p-4">
            {list.description && (
              <p className="mb-3 text-xs text-zinc-400">{list.description}</p>
            )}

            {list.movies.length > 0 && (
              <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {list.movies
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map(({ movie }) => {
                    const poster = posterUrl(movie.poster_path, "w342");
                    return (
                      <div key={movie.id} className="group relative">
                        <Link
                          href={`/movie/${movie.tmdb_id}`}
                          className="relative block aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800"
                        >
                          {poster ? (
                            <Image
                              src={poster}
                              alt={movie.title}
                              fill
                              className="object-cover transition group-hover:scale-[1.03]"
                              sizes="(max-width:640px) 25vw, 12vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center p-1">
                              <span className="line-clamp-3 text-center text-[9px] text-zinc-500">
                                {movie.title}
                              </span>
                            </div>
                          )}
                        </Link>
                        <button
                          onClick={() => startTransition(() => onRemoveMovie(movie.id))}
                          title="Remove from list"
                          className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white shadow group-hover:flex hover:bg-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            <button
              onClick={() => setShowPicker(true)}
              className="rounded-full border border-dashed border-amber-300/30 px-4 py-1.5 text-xs font-medium text-amber-200/70 transition hover:border-amber-300/60 hover:text-amber-200"
            >
              + Add films
            </button>
          </div>
        )}
      </div>

      {showPicker && (
        <MoviePicker
          watched={watched}
          alreadyIn={inListIds}
          onAdd={(movieId) => {
            startTransition(() => onAddMovie(movieId));
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main section component
// ---------------------------------------------------------------------------
export function ProfileListsSection({
  initialLists,
  watched,
}: {
  initialLists: ProfileList[];
  watched: WatchedForPicker[];
}) {
  const [lists, setLists] = useOptimistic<ProfileList[], ProfileList[]>(
    initialLists,
    (_prev, next) => next,
  );
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(v: { name: string; emoji: string; description: string; is_public: boolean }) {
    setError(null);
    try {
      const id = await createProfileList({
        name: v.name,
        emoji: v.emoji,
        description: v.description || undefined,
        is_public: v.is_public,
      });
      const newList: ProfileList = {
        id,
        name: v.name,
        emoji: v.emoji,
        description: v.description || null,
        is_public: v.is_public,
        position: lists.length,
        movies: [],
      };
      startTransition(() => setLists([...lists, newList]));
      setCreating(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create list.");
    }
  }

  async function handleDelete(listId: string) {
    setError(null);
    try {
      await deleteProfileList(listId);
      startTransition(() => setLists(lists.filter((l) => l.id !== listId)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete list.");
    }
  }

  async function handleUpdate(
    listId: string,
    v: { name: string; emoji: string; description: string; is_public: boolean },
  ) {
    setError(null);
    try {
      await updateProfileList(listId, {
        name: v.name,
        emoji: v.emoji,
        description: v.description || null,
        is_public: v.is_public,
      });
      startTransition(() =>
        setLists(
          lists.map((l) =>
            l.id === listId
              ? { ...l, name: v.name, emoji: v.emoji, description: v.description || null, is_public: v.is_public }
              : l,
          ),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update list.");
    }
  }

  async function handleAddMovie(listId: string, movieId: number) {
    setError(null);
    const film = watched.find((w) => w.movie.id === movieId);
    if (!film) return;
    try {
      await addMovieToList(listId, movieId);
      startTransition(() =>
        setLists(
          lists.map((l) => {
            if (l.id !== listId) return l;
            const newEntry: ListMovie = { movie: film.movie, position: l.movies.length };
            return { ...l, movies: [...l.movies, newEntry] };
          }),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add movie.");
    }
  }

  async function handleRemoveMovie(listId: string, movieId: number) {
    setError(null);
    try {
      await removeMovieFromList(listId, movieId);
      startTransition(() =>
        setLists(
          lists.map((l) => {
            if (l.id !== listId) return l;
            return { ...l, movies: l.movies.filter((m) => m.movie.id !== movieId) };
          }),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove movie.");
    }
  }

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">My Lists</h2>
        <button
          onClick={() => setCreating(true)}
          className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700"
        >
          + New list
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-red-900/30 px-4 py-2 text-xs text-red-300">{error}</p>
      )}

      {creating && (
        <div className="mb-4">
          <ListForm
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
            saving={isPending}
          />
        </div>
      )}

      {lists.length === 0 && !creating ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-6 py-10 text-center">
          <p className="text-sm text-zinc-400">
            Create lists to organise your films — by genre, mood, decade, or anything you like.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 inline-block rounded-full bg-amber-300/15 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-300/25"
          >
            + Create your first list
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              watched={watched}
              onDelete={() => handleDelete(list.id)}
              onUpdate={(v) => handleUpdate(list.id, v)}
              onAddMovie={(movieId) => handleAddMovie(list.id, movieId)}
              onRemoveMovie={(movieId) => handleRemoveMovie(list.id, movieId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
