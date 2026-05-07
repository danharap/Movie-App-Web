-- First-run onboarding (Letterboxd import wizard). NULL = not finished yet.
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.profiles.onboarding_completed_at is
  'Set when the user completes the first-run onboarding wizard; null triggers /onboarding after login.';

-- Existing accounts before this migration: treat as already onboarded
update public.profiles
set onboarding_completed_at = coalesce(onboarding_completed_at, now())
where onboarding_completed_at is null;
