alter table public.bookings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'bookings'
      and policyname = 'Anyone can read booking by ref_code'
  ) then
    create policy "Anyone can read booking by ref_code" on public.bookings
      for select using (true);
  end if;
end $$;
