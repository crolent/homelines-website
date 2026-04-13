create table if not exists "public"."site_settings" (
  key text primary key,
  value text,
  updated_at timestamp default now()
);

alter table "public"."site_settings" enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='site_settings' and policyname='Anyone can read settings') then
    create policy "Anyone can read settings" on "public"."site_settings" for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='site_settings' and policyname='Admin can update settings') then
    create policy "Admin can update settings" on "public"."site_settings" for update using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='site_settings' and policyname='Admin can insert settings') then
    create policy "Admin can insert settings" on "public"."site_settings" for insert with check (true);
  end if;
end $$;

insert into "public"."site_settings" (key, value)
values ('savings_popup_enabled', 'false')
on conflict (key) do nothing;
