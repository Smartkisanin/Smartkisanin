create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- The application accesses this table with the Supabase service-role key
-- from the server only. Do not expose that key to the browser.
