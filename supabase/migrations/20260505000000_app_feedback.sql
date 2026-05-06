-- App / website feedback — completely separate from movie reviews.
-- One review per registered account (UNIQUE on user_id → upsert on edit).
-- Public read; authenticated users can only mutate their own rows.

create table public.app_feedback (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  -- Snapshot of display_name at write time so we can show it even if profile changes.
  reviewer_display_name text not null default 'Anonymous user',
  rating      smallint not null check (rating between 1 and 5),
  body        text not null check (char_length(trim(body)) >= 10),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id)
);

create index app_feedback_created_at_idx on public.app_feedback (created_at desc);

create trigger app_feedback_updated
  before update on public.app_feedback
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.app_feedback enable row level security;

-- Everyone (including anon) can read reviews.
create policy "feedback_select_public"
  on public.app_feedback for select
  using (true);

-- Authenticated users may insert a review for themselves only.
create policy "feedback_insert_own"
  on public.app_feedback for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users may update only their own row.
create policy "feedback_update_own"
  on public.app_feedback for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Users may delete only their own row.
create policy "feedback_delete_own"
  on public.app_feedback for delete
  to authenticated
  using (user_id = auth.uid());
