-- Letterboxd-style profile customization: banner + full-page backdrop
alter table public.profiles
  add column if not exists banner_url text,
  add column if not exists profile_background_url text;

comment on column public.profiles.banner_url is 'Wide header banner image URL (public Supabase storage or external HTTPS)';
comment on column public.profiles.profile_background_url is 'Optional page backdrop image URL';
