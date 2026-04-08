create table if not exists public.savings_claims (
  id uuid default gen_random_uuid() primary key,
  email text unique,
  claimed_at timestamp default now(),
  first_discount_used boolean default false,
  third_discount_used boolean default false,
  fifth_discount_used boolean default false
);

alter table public.savings_claims enable row level security;

create policy "Anyone can insert claim" on public.savings_claims
  for insert with check (true);

create policy "Anyone can read own claim" on public.savings_claims
  for select using (true);

create policy "Anyone can update claim" on public.savings_claims
  for update using (true);
