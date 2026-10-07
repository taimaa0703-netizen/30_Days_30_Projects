-- Run once in Supabase → SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  salary numeric not null default 0 check (salary >= 0),
  savings_goal numeric not null default 0 check (savings_goal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, month_key)
);

create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  name text not null,
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  amount numeric not null check (amount > 0),
  category text not null default 'other',
  note text,
  spent_at date not null default current_date,
  receipt_path text,
  created_at timestamptz not null default now()
);

create index if not exists months_user_month_idx on public.months(user_id, month_key);
create index if not exists fixed_user_month_idx on public.fixed_expenses(user_id, month_key);
create index if not exists expenses_user_month_idx on public.expenses(user_id, month_key);

alter table public.months enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.expenses enable row level security;

revoke all on public.months, public.fixed_expenses, public.expenses from anon, authenticated;
grant select, insert, update, delete on public.months, public.fixed_expenses, public.expenses to authenticated;

-- Separate policies keep ownership explicit.
do $$ begin
  create policy "months_select_own" on public.months for select to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "months_insert_own" on public.months for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "months_update_own" on public.months for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "months_delete_own" on public.months for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "fixed_select_own" on public.fixed_expenses for select to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "fixed_insert_own" on public.fixed_expenses for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "fixed_update_own" on public.fixed_expenses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "fixed_delete_own" on public.fixed_expenses for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "expenses_select_own" on public.expenses for select to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "expenses_insert_own" on public.expenses for insert to authenticated with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "expenses_update_own" on public.expenses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "expenses_delete_own" on public.expenses for delete to authenticated using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;
