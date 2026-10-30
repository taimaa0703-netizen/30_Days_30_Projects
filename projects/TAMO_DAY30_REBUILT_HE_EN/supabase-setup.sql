create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  project_type text,
  goal text,
  audience text,
  stage text,
  budget text,
  timeline text,
  notes text,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'completed'))
);

alter table public.inquiries
  drop constraint if exists inquiries_name_check,
  drop constraint if exists inquiries_email_check,
  drop constraint if exists inquiries_project_type_check,
  drop constraint if exists inquiries_goal_check,
  drop constraint if exists inquiries_audience_check,
  drop constraint if exists inquiries_stage_check,
  drop constraint if exists inquiries_budget_check,
  drop constraint if exists inquiries_timeline_check,
  drop constraint if exists inquiries_notes_check,
  drop constraint if exists inquiries_consent_accepted_check,
  alter column name drop not null,
  alter column email drop not null,
  alter column project_type drop not null,
  alter column goal drop not null,
  alter column audience drop not null,
  alter column stage drop not null,
  alter column budget drop not null,
  alter column timeline drop not null,
  alter column notes drop not null,
  drop column if exists consent_accepted;

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

alter table public.inquiries enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on table public.inquiries from anon, authenticated;

grant insert (name, email, project_type, goal, audience, stage, budget, timeline, notes)
  on table public.inquiries to anon;
grant select, delete on table public.inquiries to authenticated;
grant update (status) on table public.inquiries to authenticated;

drop policy if exists "Anyone can submit an inquiry" on public.inquiries;
create policy "Anyone can submit an inquiry"
  on public.inquiries for insert to anon
  with check (true);

drop policy if exists "Only the site admin can view inquiries" on public.inquiries;
create policy "Only the site admin can view inquiries"
  on public.inquiries for select to authenticated
  using ((select auth.jwt() ->> 'email') = 'taimaa.openu@gmail.com');

drop policy if exists "Only the site admin can update inquiry status" on public.inquiries;
create policy "Only the site admin can update inquiry status"
  on public.inquiries for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'taimaa.openu@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'taimaa.openu@gmail.com');

drop policy if exists "Only the site admin can delete inquiries" on public.inquiries;
create policy "Only the site admin can delete inquiries"
  on public.inquiries for delete to authenticated
  using ((select auth.jwt() ->> 'email') = 'taimaa.openu@gmail.com');
