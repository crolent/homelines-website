alter table public.savings_claims add column if not exists promo_code text unique;
alter table public.savings_claims add column if not exists times_used int default 0;
alter table public.bookings add column if not exists promo_code text;
