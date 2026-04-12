alter table "public"."bookings" add column if not exists "coupon_discount" integer not null default 0;
