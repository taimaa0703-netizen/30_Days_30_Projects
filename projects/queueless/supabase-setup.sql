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

-- Owners without email sign in with their phone number and a PIN instead of Supabase Auth.
create extension if not exists pgcrypto with schema extensions;
alter table public.businesses alter column owner_id drop not null;
alter table public.businesses add column if not exists login_phone text unique;
alter table public.businesses add column if not exists pin_hash text;
alter table public.businesses add column if not exists pin_fails int not null default 0;
alter table public.businesses add column if not exists locked_until timestamptz;
alter table public.businesses drop constraint if exists businesses_has_owner;
alter table public.businesses add constraint businesses_has_owner
  check (owner_id is not null or (login_phone is not null and pin_hash is not null));

create table if not exists public.owner_sessions (
  token_hash text primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.owner_sessions enable row level security;
revoke all on table public.owner_sessions from anon, authenticated;

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
-- Column grants keep login_phone, pin_hash and lockout fields private.
grant select (id, name, phone, slot_minutes, hours, timezone) on public.businesses to anon;
grant select (id, owner_id, name, phone, slot_minutes, hours, timezone, created_at) on public.businesses to authenticated;
grant insert (name, phone, timezone) on public.businesses to authenticated;
grant update (name, phone, slot_minutes, hours, timezone) on public.businesses to authenticated;
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

-- ---------------------------------------------------------------------
-- Owner sign-in with phone number + PIN (no email needed).
-- The browser keeps a random session token; only its SHA-256 hash is stored.
-- ---------------------------------------------------------------------
drop function if exists public.phone_owner_enter(text, text, text, text);
create function public.phone_owner_enter(p_name text, p_phone text, p_pin text, p_timezone text default 'Asia/Jerusalem')
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_key text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  b businesses;
  tok text;
  tz text := coalesce(nullif(btrim(p_timezone), ''), 'Asia/Jerusalem');
begin
  -- Errors are returned (not raised) so failed-attempt counters are not rolled back.
  if btrim(coalesce(p_phone, '')) !~ '^[0-9+() .-]{5,30}$' or char_length(v_key) not between 7 and 15 then
    return jsonb_build_object('error', 'INVALID_PHONE');
  end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4,8}$' then return jsonb_build_object('error', 'INVALID_PIN'); end if;
  if not exists (select 1 from pg_timezone_names where name = tz) then tz := 'Asia/Jerusalem'; end if;

  select * into b from businesses where login_phone = v_key for update;
  if found then
    if b.locked_until is not null and b.locked_until > now() then
      return jsonb_build_object('error', 'LOCKED');
    end if;
    if b.pin_hash is null or crypt(p_pin, b.pin_hash) <> b.pin_hash then
      update businesses
        set pin_fails = case when b.pin_fails + 1 >= 5 then 0 else b.pin_fails + 1 end,
            locked_until = case when b.pin_fails + 1 >= 5 then now() + interval '15 minutes' else null end
        where id = b.id;
      return jsonb_build_object('error', case when b.pin_fails + 1 >= 5 then 'LOCKED' else 'WRONG_PIN' end);
    end if;
    update businesses set pin_fails = 0, locked_until = null where id = b.id;
  else
    p_name := btrim(coalesce(p_name, ''));
    if char_length(p_name) not between 1 and 80 then return jsonb_build_object('error', 'INVALID_NAME'); end if;
    begin
      insert into businesses (owner_id, name, phone, timezone, login_phone, pin_hash)
      values (null, p_name, btrim(p_phone), tz, v_key, crypt(p_pin, gen_salt('bf')))
      returning * into b;
    exception when unique_violation then
      return jsonb_build_object('error', 'TRY_AGAIN');
    end;
  end if;

  tok := encode(gen_random_bytes(32), 'hex');
  insert into owner_sessions (token_hash, business_id) values (encode(digest(tok, 'sha256'), 'hex'), b.id);
  return jsonb_build_object('token', tok, 'business_id', b.id, 'name', b.name, 'phone', b.phone);
end;
$$;

drop function if exists public.owner_business_id(text);
create function public.owner_business_id(p_token text)
returns uuid
language plpgsql stable security definer set search_path = public, extensions as $$
declare bid uuid;
begin
  select s.business_id into bid from owner_sessions s
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
  if bid is null then raise exception 'NOT_SIGNED_IN'; end if;
  return bid;
end;
$$;

drop function if exists public.owner_business(text);
create function public.owner_business(p_token text)
returns table (id uuid, name text, phone text, slot_minutes int, hours jsonb, timezone text)
language plpgsql stable security definer set search_path = public as $$
declare bid uuid := owner_business_id(p_token);
begin
  return query select b.id, b.name, b.phone, b.slot_minutes, b.hours, b.timezone from businesses b where b.id = bid;
end;
$$;

drop function if exists public.owner_appointments(text, timestamptz, timestamptz);
create function public.owner_appointments(p_token text, p_from timestamptz, p_to timestamptz)
returns setof public.appointments
language plpgsql stable security definer set search_path = public as $$
declare bid uuid := owner_business_id(p_token);
begin
  return query select a.* from appointments a
  where a.business_id = bid and a.starts_at >= p_from and a.starts_at < p_to
    and p_to - p_from <= interval '62 days'
  order by a.starts_at;
end;
$$;

drop function if exists public.owner_next_appointment(text);
create function public.owner_next_appointment(p_token text)
returns table (starts_at timestamptz, customer_name text)
language plpgsql stable security definer set search_path = public as $$
declare bid uuid := owner_business_id(p_token);
begin
  return query select a.starts_at, a.customer_name from appointments a
  where a.business_id = bid and a.status in ('booked', 'arrived') and a.ends_at > now()
  order by a.starts_at limit 1;
end;
$$;

drop function if exists public.owner_new_bookings(text, timestamptz);
create function public.owner_new_bookings(p_token text, p_since timestamptz)
returns setof public.appointments
language plpgsql stable security definer set search_path = public as $$
declare bid uuid := owner_business_id(p_token);
begin
  return query select a.* from appointments a
  where a.business_id = bid and a.created_at > p_since and a.created_at > now() - interval '1 day'
  order by a.created_at limit 20;
end;
$$;

drop function if exists public.owner_set_status(text, uuid, text);
create function public.owner_set_status(p_token text, p_id uuid, p_status text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('booked', 'arrived', 'done', 'cancelled', 'no_show') then raise exception 'INVALID_STATUS'; end if;
  update appointments set status = p_status
  where id = p_id and business_id = owner_business_id(p_token);
  return found;
end;
$$;

drop function if exists public.owner_update_business(text, text, text, jsonb, int);
create function public.owner_update_business(p_token text, p_name text, p_phone text, p_hours jsonb, p_slot_minutes int)
returns table (id uuid, name text, phone text, slot_minutes int, hours jsonb, timezone text)
language plpgsql security definer set search_path = public as $$
declare bid uuid := owner_business_id(p_token);
begin
  if p_hours is null or jsonb_typeof(p_hours) <> 'object' then raise exception 'INVALID_HOURS'; end if;
  update businesses b
    set name = btrim(p_name), phone = nullif(btrim(coalesce(p_phone, '')), ''), hours = p_hours, slot_minutes = p_slot_minutes
    where b.id = bid;
  return query select b.id, b.name, b.phone, b.slot_minutes, b.hours, b.timezone from businesses b where b.id = bid;
end;
$$;

drop function if exists public.owner_sign_out(text);
create function public.owner_sign_out(p_token text)
returns void
language sql security definer set search_path = public, extensions as $$
  delete from owner_sessions where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
$$;

revoke all on function public.phone_owner_enter(text, text, text, text) from public;
revoke all on function public.owner_business_id(text) from public, anon, authenticated;
revoke all on function public.owner_business(text) from public;
revoke all on function public.owner_appointments(text, timestamptz, timestamptz) from public;
revoke all on function public.owner_next_appointment(text) from public;
revoke all on function public.owner_new_bookings(text, timestamptz) from public;
revoke all on function public.owner_set_status(text, uuid, text) from public;
revoke all on function public.owner_update_business(text, text, text, jsonb, int) from public;
revoke all on function public.owner_sign_out(text) from public;
grant execute on function public.phone_owner_enter(text, text, text, text) to anon, authenticated;
grant execute on function public.owner_business(text) to anon, authenticated;
grant execute on function public.owner_appointments(text, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.owner_next_appointment(text) to anon, authenticated;
grant execute on function public.owner_new_bookings(text, timestamptz) to anon, authenticated;
grant execute on function public.owner_set_status(text, uuid, text) to anon, authenticated;
grant execute on function public.owner_update_business(text, text, text, jsonb, int) to anon, authenticated;
grant execute on function public.owner_sign_out(text) to anon, authenticated;

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
