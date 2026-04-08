alter table public.savings_claims
  add column if not exists phone text,
  add column if not exists address_hash text,
  add column if not exists blocked boolean default false;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'savings_claims' and policyname = 'anon_insert_claims'
  ) then
    create policy "anon_insert_claims" on public.savings_claims for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'savings_claims' and policyname = 'anon_read_claims'
  ) then
    create policy "anon_read_claims" on public.savings_claims for select using (true);
  end if;
end $$;

create table if not exists public.fraud_attempts (
  id uuid default gen_random_uuid() primary key,
  email text,
  phone text,
  address text,
  matched_claim_id uuid,
  match_type text,
  created_at timestamp default now()
);

alter table public.fraud_attempts enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'fraud_attempts' and policyname = 'anon_insert_fraud'
  ) then
    create policy "anon_insert_fraud" on public.fraud_attempts for insert with check (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'fraud_attempts' and policyname = 'admin_read_fraud'
  ) then
    create policy "admin_read_fraud" on public.fraud_attempts for select using (true);
  end if;
end $$;
