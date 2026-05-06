-- ---------------------------------------------------------------------------
-- 1. Profile Lists  (user-created named sections like Letterboxd lists)
-- ---------------------------------------------------------------------------
create table if not exists public.profile_lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  description text check (char_length(description) <= 280),
  emoji       text,
  position    smallint not null default 0,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profile_lists_user_id_idx
  on public.profile_lists (user_id, position);

alter table public.profile_lists enable row level security;

-- anyone can read public lists; owners can read all their own
create policy "list_select_public"
  on public.profile_lists for select using (is_public = true);

create policy "list_select_own"
  on public.profile_lists for select using (user_id = auth.uid());

create policy "list_insert_own"
  on public.profile_lists for insert to authenticated
  with check (user_id = auth.uid());

create policy "list_update_own"
  on public.profile_lists for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "list_delete_own"
  on public.profile_lists for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. Profile List Movies  (movies inside a list)
-- ---------------------------------------------------------------------------
create table if not exists public.profile_list_movies (
  id       bigserial primary key,
  list_id  uuid    not null references public.profile_lists(id) on delete cascade,
  movie_id bigint  not null references public.movies(id) on delete cascade,
  position smallint not null default 0,
  added_at timestamptz not null default now(),
  unique (list_id, movie_id)
);

create index if not exists profile_list_movies_list_id_idx
  on public.profile_list_movies (list_id, position);

alter table public.profile_list_movies enable row level security;

-- readable when the parent list is readable
create policy "list_movies_select"
  on public.profile_list_movies for select
  using (
    exists (
      select 1 from public.profile_lists pl
      where pl.id = list_id
        and (pl.user_id = auth.uid() or pl.is_public = true)
    )
  );

create policy "list_movies_insert_own"
  on public.profile_list_movies for insert to authenticated
  with check (
    exists (
      select 1 from public.profile_lists pl
      where pl.id = list_id and pl.user_id = auth.uid()
    )
  );

create policy "list_movies_update_own"
  on public.profile_list_movies for update to authenticated
  using (
    exists (
      select 1 from public.profile_lists pl
      where pl.id = list_id and pl.user_id = auth.uid()
    )
  );

create policy "list_movies_delete_own"
  on public.profile_list_movies for delete to authenticated
  using (
    exists (
      select 1 from public.profile_lists pl
      where pl.id = list_id and pl.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Follows  (one-directional, like Letterboxd/Instagram)
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create index if not exists follows_follower_idx  on public.follows (follower_id);
create index if not exists follows_following_idx on public.follows (following_id);

alter table public.follows enable row level security;

create policy "follows_select_all"
  on public.follows for select using (true);

create policy "follows_insert_own"
  on public.follows for insert to authenticated
  with check (follower_id = auth.uid());

create policy "follows_delete_own"
  on public.follows for delete to authenticated
  using (follower_id = auth.uid());
