drop policy if exists "anon_insert_claims" on public.savings_claims;
drop policy if exists "anon_read_claims" on public.savings_claims;
drop policy if exists "anon_update_claims" on public.savings_claims;
drop policy if exists "Anyone can insert claim" on public.savings_claims;
drop policy if exists "Anyone can read own claim" on public.savings_claims;
drop policy if exists "Anyone can update claim" on public.savings_claims;

create policy "anon_insert_claims" on public.savings_claims
  for insert with check (true);

create policy "anon_read_claims" on public.savings_claims
  for select using (true);

create policy "anon_update_claims" on public.savings_claims
  for update using (true);
