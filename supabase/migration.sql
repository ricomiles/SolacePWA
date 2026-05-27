-- Solace Journal — Supabase schema migration
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- User encryption keys (one row per user)
create table if not exists user_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  salt    text not null,          -- base64 random 16-byte salt, generated client-side at signup
  created_at timestamptz default now()
);

alter table user_keys enable row level security;
create policy "own key" on user_keys
  for all using (auth.uid() = user_id);

-- Journal entries (ciphertext only — server never sees plaintext)
create table if not exists entries (
  id                uuid primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  ciphertext        text not null,          -- base64 AES-GCM ciphertext
  iv                text not null,          -- base64 12-byte IV, unique per entry
  deleted           boolean not null default false,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  client_updated_at timestamptz not null    -- client clock; used for last-write-wins merge
);

alter table entries enable row level security;
create policy "own entries" on entries
  for all using (auth.uid() = user_id);

-- Index for fast per-user queries
create index if not exists entries_user_id_idx on entries (user_id, client_updated_at desc);

-- Auto-update updated_at on server
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entries_updated_at
  before update on entries
  for each row execute function update_updated_at();
