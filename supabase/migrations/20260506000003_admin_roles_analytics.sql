-- ---------------------------------------------------------------------------
-- 1. Extend profiles: role, status, admin_notes
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role    text not null default 'user'
    check (role in ('user', 'moderator', 'admin', 'super_admin')),
  add column if not exists status  text not null default 'active'
    check (status in ('active', 'suspended', 'banned')),
  add column if not exists admin_notes text,
  add column if not exists last_active_at timestamptz;

-- Index for fast role filtering in admin panel
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- 2. Prevent role self-escalation via a before-update trigger
--    (belt-and-suspenders; server actions also enforce this)
-- ---------------------------------------------------------------------------
create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql security definer as $$
begin
  -- Block any update that changes role and is NOT the service role
  if new.role <> old.role then
    -- auth.role() = 'service_role' when using the service-key client
    if auth.role() <> 'service_role' then
      raise exception 'Role changes require elevated privileges';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- ---------------------------------------------------------------------------
-- 3. Admin RLS additions on profiles
--    (existing own-read/own-write policies are preserved)
-- ---------------------------------------------------------------------------

-- Admins can read ALL profiles
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );

-- Admins can update status/admin_notes on other profiles
-- (role column changes are gated by the trigger above)
create policy "profiles_update_admin"
  on public.profiles for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  )
  with check (true);

-- Admins can read watched_movies of any user
create policy "watched_select_admin"
  on public.watched_movies for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );

-- Admins can read watchlist of any user
create policy "watchlist_select_admin"
  on public.watchlist for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Role Audit Log
-- ---------------------------------------------------------------------------
create table if not exists public.role_audit_logs (
  id          bigserial primary key,
  actor_id    uuid references public.profiles (id) on delete set null,
  target_id   uuid references public.profiles (id) on delete set null,
  old_role    text,
  new_role    text not null,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists role_audit_actor_idx  on public.role_audit_logs (actor_id);
create index if not exists role_audit_target_idx on public.role_audit_logs (target_id);
create index if not exists role_audit_time_idx   on public.role_audit_logs (created_at desc);

alter table public.role_audit_logs enable row level security;

create policy "audit_select_admin"
  on public.role_audit_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );

create policy "audit_insert_service"
  on public.role_audit_logs for insert
  with check (true);  -- enforced by server; service role inserts

-- ---------------------------------------------------------------------------
-- 5. Analytics Events
-- ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id          bigserial primary key,
  event_name  text not null,
  user_id     uuid references public.profiles (id) on delete set null,
  properties  jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists analytics_event_name_idx on public.analytics_events (event_name);
create index if not exists analytics_user_id_idx    on public.analytics_events (user_id);
create index if not exists analytics_created_at_idx on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

-- Admins can read all events
create policy "analytics_select_admin"
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'super_admin')
    )
  );

-- Any authenticated user can insert their own events (or null user events)
create policy "analytics_insert_authenticated"
  on public.analytics_events for insert to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- ---------------------------------------------------------------------------
-- NOTE: To grant yourself super_admin, run this once in Supabase SQL editor:
--   UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your@email.com';
-- ---------------------------------------------------------------------------
