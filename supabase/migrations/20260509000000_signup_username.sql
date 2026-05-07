-- ---------------------------------------------------------------------------
-- Capture the chosen username at signup
-- ---------------------------------------------------------------------------
-- The signup form now collects { display_name, username, email, password }.
-- The username is forwarded to Supabase auth via raw_user_meta_data.
-- This trigger update copies it into public.profiles when the auth.users row
-- is created, alongside the existing display_name + email handling.
-- A unique-violation here will roll back the auth.users insert, so the API
-- pre-checks availability before calling auth.signUp() to give a clean error.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, username)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data ->> 'username', '')
  );
  return new;
end;
$$;
