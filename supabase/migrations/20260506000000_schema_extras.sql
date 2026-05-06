-- ---------------------------------------------------------------------------
-- 1. Add vote_count to the TMDb movie cache
-- ---------------------------------------------------------------------------
alter table public.movies
  add column if not exists vote_count int;

-- ---------------------------------------------------------------------------
-- 2. Top-4 favourite movies per user (Letterboxd-style)
-- ---------------------------------------------------------------------------
create table if not exists public.favourite_movies (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  movie_id    bigint not null references public.movies (id) on delete cascade,
  position    smallint not null check (position between 1 and 4),
  created_at  timestamptz not null default now(),
  unique (user_id, position),
  unique (user_id, movie_id)
);

create index if not exists favourite_movies_user_id_idx
  on public.favourite_movies (user_id, position);

alter table public.favourite_movies enable row level security;

create policy "fav_select_own"
  on public.favourite_movies for select
  using (user_id = auth.uid());

create policy "fav_insert_own"
  on public.favourite_movies for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "fav_update_own"
  on public.favourite_movies for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "fav_delete_own"
  on public.favourite_movies for delete
  to authenticated
  using (user_id = auth.uid());
