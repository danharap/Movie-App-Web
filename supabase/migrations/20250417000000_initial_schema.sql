-- Movie app: profiles, movie cache, library, preferences, sessions
-- Run via Supabase CLI or SQL editor after project creation.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Movies (TMDb cache)
-- ---------------------------------------------------------------------------
create table public.movies (
  id bigserial primary key,
  tmdb_id int not null unique,
  title text not null,
  release_year int,
  poster_path text,
  backdrop_path text,
  overview text,
  runtime int,
  vote_average numeric,
  genres jsonb,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index movies_tmdb_id_idx on public.movies (tmdb_id);

create trigger movies_updated
  before update on public.movies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- User library & preferences
-- ---------------------------------------------------------------------------
create table public.watched_movies (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  movie_id bigint not null references public.movies (id) on delete cascade,
  watched_at timestamptz not null default now(),
  user_rating numeric,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

create index watched_movies_user_id_idx on public.watched_movies (user_id);
create index watched_movies_watched_at_idx on public.watched_movies (user_id, watched_at desc);

create table public.watchlist (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  movie_id bigint not null references public.movies (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

create index watchlist_user_id_idx on public.watchlist (user_id);

create table public.dismissed_movies (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  movie_id bigint not null references public.movies (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

create index dismissed_movies_user_id_idx on public.dismissed_movies (user_id);

create table public.user_preferences (
  id bigserial primary key,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  favorite_genres jsonb,
  default_runtime_min int,
  default_runtime_max int,
  language_preferences jsonb,
  tone_preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_preferences_updated
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create table public.recommendation_sessions (
  id bigserial primary key,
  user_id uuid references public.profiles (id) on delete set null,
  input_payload jsonb not null,
  result_movie_ids jsonb not null,
  created_at timestamptz not null default now()
);

create index recommendation_sessions_user_id_idx on public.recommendation_sessions (user_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

alter table public.movies enable row level security;

create policy "movies_select_public"
  on public.movies for select
  using (true);

create policy "movies_insert_authenticated"
  on public.movies for insert
  to authenticated
  with check (true);

create policy "movies_update_authenticated"
  on public.movies for update
  to authenticated
  using (true)
  with check (true);

alter table public.watched_movies enable row level security;

create policy "watched_all_own"
  on public.watched_movies for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.watchlist enable row level security;

create policy "watchlist_all_own"
  on public.watchlist for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.dismissed_movies enable row level security;

create policy "dismissed_all_own"
  on public.dismissed_movies for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.user_preferences enable row level security;

create policy "prefs_all_own"
  on public.user_preferences for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.recommendation_sessions enable row level security;

create policy "sessions_select_own"
  on public.recommendation_sessions for select
  using (user_id = auth.uid());

create policy "sessions_insert_own"
  on public.recommendation_sessions for insert
  with check (user_id = auth.uid());
