create table if not exists public.customer_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users unique,
  first_name text,
  last_name text,
  phone text,
  address text,
  city text,
  zip text,
  updated_at timestamp default now()
);

alter table public.customer_profiles enable row level security;

create policy "Users read own profile" on public.customer_profiles
  for select using (auth.uid() = user_id);

create policy "Users update own profile" on public.customer_profiles
  for update using (auth.uid() = user_id);

create policy "Users insert own profile" on public.customer_profiles
  for insert with check (auth.uid() = user_id);

alter table public.bookings enable row level security;

create policy "Users read own bookings" on public.bookings
  for select using (auth.uid() = user_id);
