create table if not exists public.push_subscriptions (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  subscription  jsonb not null,
  reminder_time text not null default '21:00',
  streak_nudge  boolean not null default false,
  created_at    timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Users manage own subscription"
  on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
