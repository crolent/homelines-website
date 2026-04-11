create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  first_name  text,
  last_name   text,
  email       text not null,
  phone       text,
  service     text,
  message     text,
  status      text default 'new',
  created_at  timestamptz default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can insert messages"
  on public.contact_messages for insert with check (true);

create policy "Anyone can read messages"
  on public.contact_messages for select using (true);

create policy "Anyone can update messages"
  on public.contact_messages for update using (true);
