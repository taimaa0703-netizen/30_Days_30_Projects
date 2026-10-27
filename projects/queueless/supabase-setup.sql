-- QUEUELESS online booking setup.
-- Paste this whole file into Supabase -> SQL Editor -> New query, then click Run.
-- Safe to run more than once.

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() unique references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  phone text check (phone is null or char_length(phone) <= 30),
  slot_minutes int not null default 30 check (slot_minutes between 5 and 240),
  hours jsonb not null default '{"0":["09:00","17:00"],"1":["09:00","17:00"],"2":["09:00","17:00"],"3":["09:00","17:00"],"4":["09:00","17:00"],"5":["09:00","13:00"],"6":null}'::jsonb
    check (jsonb_typeof(hours) = 'object'),
  timezone text not null default 'Asia/Jerusalem',
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  customer_name text not null check (char_length(customer_name) between 1 and 80),
  customer_phone text not null check (char_length(customer_phone) between 5 and 30),
  note text check (note is null or char_length(note) <= 500),
  status text not null default 'booked' check (status in ('booked', 'arrived', 'done', 'cancelled', 'no_show')),
  created_at timestamptz not null default now()
);

create unique index if not exists appointments_slot_unique
  on public.appointments (business_id, starts_at) where status <> 'cancelled';
create index if not exists appointments_business_time
  on public.appointments (business_id, starts_at);

alter table public.businesses enable row level security;
alter table public.appointments enable row level security;

-- Only expose what each role needs. Customers never read the appointments table directly.
revoke all on table public.businesses, public.appointments from anon, authenticated;
grant select (id, name, phone, slot_minutes, hours, timezone) on public.businesses to anon;
grant select, insert, update on public.businesses to authenticated;
grant select, update on public.appointments to authenticated;

drop policy if exists "Businesses are listed publicly" on public.businesses;
create policy "Businesses are listed publicly" on public.businesses
  for select to anon, authenticated using (true);

drop policy if exists "Owners create their business" on public.businesses;
create policy "Owners create their business" on public.businesses
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "Owners update their business" on public.businesses;
create policy "Owners update their business" on public.businesses
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Owners read their appointments" on public.appointments;
create policy "Owners read their appointments" on public.appointments
  for select to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "Owners update their appointments" on public.appointments;
create policy "Owners update their appointments" on public.appointments
  for update to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

-- Taken time ranges only (no customer details), so customers can see which slots are free.
drop function if exists public.busy_slots(uuid, timestamptz, timestamptz);
create function public.busy_slots(p_business uuid, p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = public as $$
  select a.starts_at, a.ends_at
  from appointments a
  where a.business_id = p_business
    and a.status <> 'cancelled'
    and a.starts_at < p_to
    and a.ends_at > p_from
    and p_to - p_from <= interval '62 days';
$$;

drop function if exists public.book_appointment(uuid, timestamptz, text, text, text);
create function public.book_appointment(p_business uuid, p_start timestamptz, p_name text, p_phone text, p_note text default null)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  b businesses;
  local_ts timestamp;
  day_hours jsonb;
  open_t time;
  close_t time;
  slot interval;
  new_id uuid;
begin
  select * into b from businesses where id = p_business;
  if not found then raise exception 'BUSINESS_NOT_FOUND'; end if;

  p_name := btrim(coalesce(p_name, ''));
  p_phone := btrim(coalesce(p_phone, ''));
  p_note := nullif(btrim(coalesce(p_note, '')), '');
  if char_length(p_name) not between 1 and 80 then raise exception 'INVALID_NAME'; end if;
  if p_phone !~ '^[0-9+() .-]{5,30}$' or char_length(regexp_replace(p_phone, '[^0-9]', '', 'g')) < 7 then
    raise exception 'INVALID_PHONE';
  end if;
  if p_note is not null and char_length(p_note) > 500 then raise exception 'INVALID_NOTE'; end if;
  if p_start <= now() or p_start > now() + interval '60 days' then raise exception 'INVALID_TIME'; end if;

  slot := make_interval(mins => b.slot_minutes);
  local_ts := p_start at time zone b.timezone;
  day_hours := b.hours -> (extract(dow from local_ts)::int)::text;
  if day_hours is null or jsonb_typeof(day_hours) <> 'array' then raise exception 'CLOSED'; end if;
  open_t := (day_hours ->> 0)::time;
  close_t := (day_hours ->> 1)::time;
  if local_ts::time < open_t
     or (local_ts::time - open_t) + slot > (close_t - open_t)
     or mod(extract(epoch from (local_ts::time - open_t))::int, b.slot_minutes * 60) <> 0 then
    raise exception 'INVALID_TIME';
  end if;

  -- Serialize bookings per business so two customers cannot take the same time.
  perform pg_advisory_xact_lock(hashtext(p_business::text));
  if exists (
    select 1 from appointments a
    where a.business_id = p_business and a.status <> 'cancelled'
      and a.starts_at < p_start + slot and a.ends_at > p_start
  ) then
    raise exception 'SLOT_TAKEN';
  end if;
  if (
    select count(*) from appointments a
    where a.business_id = p_business and a.customer_phone = p_phone
      and a.status = 'booked' and a.starts_at > now()
  ) >= 3 then
    raise exception 'TOO_MANY';
  end if;

  insert into appointments (business_id, starts_at, ends_at, customer_name, customer_phone, note)
  values (p_business, p_start, p_start + slot, p_name, p_phone, p_note)
  returning id into new_id;
  return new_id;
end;
$$;

-- The booking id is an unguessable token that only the customer who booked receives.
drop function if exists public.get_booking(uuid);
create function public.get_booking(p_id uuid)
returns table (
  id uuid, business_id uuid, business_name text, business_phone text, timezone text,
  starts_at timestamptz, ends_at timestamptz, status text, customer_name text, note text
)
language sql stable security definer set search_path = public as $$
  select a.id, a.business_id, b.name, b.phone, b.timezone, a.starts_at, a.ends_at, a.status, a.customer_name, a.note
  from appointments a
  join businesses b on b.id = a.business_id
  where a.id = p_id;
$$;

drop function if exists public.cancel_booking(uuid);
create function public.cancel_booking(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update appointments set status = 'cancelled'
  where id = p_id and status = 'booked' and starts_at > now();
  return found;
end;
$$;

revoke all on function public.busy_slots(uuid, timestamptz, timestamptz) from public;
revoke all on function public.book_appointment(uuid, timestamptz, text, text, text) from public;
revoke all on function public.get_booking(uuid) from public;
revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.busy_slots(uuid, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.book_appointment(uuid, timestamptz, text, text, text) to anon, authenticated;
grant execute on function public.get_booking(uuid) to anon, authenticated;
grant execute on function public.cancel_booking(uuid) to anon, authenticated;

-- Live updates on the owner's dashboard.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
end;
$$;
