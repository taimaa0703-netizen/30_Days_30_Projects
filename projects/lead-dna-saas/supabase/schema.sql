-- Run in Supabase SQL Editor. MVP tenant model: one owner per workspace.
-- Do not put service_role keys in the client.
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);
create index if not exists workspaces_owner_idx on public.workspaces(owner_id);
create table if not exists public.campaigns (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  external_id text not null,
  campaign_name text not null,
  platform text not null,
  spend numeric(16,2) not null default 0 check(spend>=0),
  impressions bigint not null default 0 check(impressions>=0),
  clicks bigint not null default 0 check(clicks>=0),
  currency text not null default 'ILS',
  reporting_start date,
  reporting_end date,
  primary key(workspace_id,external_id)
);
create table if not exists public.leads (
  workspace_id uuid not null,
  external_id text not null,
  campaign_external_id text not null,
  status text not null check(status in ('new','contacted','qualified','unqualified','won','lost')),
  revenue numeric(16,2) default 0 check(revenue>=0),
  response_minutes numeric(12,2) not null default 0 check(response_minutes>=0),
  created_at timestamptz,
  source_type text check(source_type in ('instant_form','website') or source_type is null),
  currency text not null default 'ILS',
  primary key(workspace_id,external_id),
  foreign key(workspace_id,campaign_external_id) references public.campaigns(workspace_id,external_id) on delete cascade
);
-- Idempotent additions for workspaces created with the original MVP schema.
alter table public.campaigns add column if not exists currency text not null default 'ILS';
alter table public.campaigns add column if not exists reporting_start date;
alter table public.campaigns add column if not exists reporting_end date;
alter table public.leads alter column created_at drop not null;
alter table public.leads alter column response_minutes drop not null;
alter table public.leads alter column revenue drop not null;
alter table public.leads add column if not exists source_type text;
alter table public.leads add column if not exists currency text not null default 'ILS';
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check(status in ('new','contacted','qualified','unqualified','won','lost'));
alter table public.leads drop constraint if exists leads_source_type_check;
alter table public.leads add constraint leads_source_type_check check(source_type in ('instant_form','website') or source_type is null);
create index if not exists leads_campaign_idx on public.leads(workspace_id,campaign_external_id);
alter table public.workspaces enable row level security;
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;
drop policy if exists "Owner can view workspace" on public.workspaces;
create policy "Owner can view workspace" on public.workspaces for select to authenticated using(owner_id=(select auth.uid()));
drop policy if exists "Owner can create workspace" on public.workspaces;
create policy "Owner can create workspace" on public.workspaces for insert to authenticated with check(owner_id=(select auth.uid()));
drop policy if exists "Owner can update workspace" on public.workspaces;
create policy "Owner can update workspace" on public.workspaces for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
drop policy if exists "Owner can delete workspace" on public.workspaces;
create policy "Owner can delete workspace" on public.workspaces for delete to authenticated using(owner_id=(select auth.uid()));
drop policy if exists "Owner can read campaigns" on public.campaigns;
create policy "Owner can read campaigns" on public.campaigns for select to authenticated using(exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=(select auth.uid())));
drop policy if exists "Owner can read leads" on public.leads;
create policy "Owner can read leads" on public.leads for select to authenticated using(exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=(select auth.uid())));
-- Atomic CSV replacement RPC: validates tenant ownership and each row, then replaces both tables.
-- SECURITY INVOKER uses RLS; function executes as authenticated user, with explicit ownership check.
-- RLS only permits select for underlying data. This narrow definer function performs writes.
create or replace function public.replace_workspace_data(p_workspace_id uuid,p_campaigns jsonb,p_leads jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare c jsonb; l jsonb;
begin
  if auth.uid() is null or not exists(select 1 from public.workspaces where id=p_workspace_id and owner_id=auth.uid()) then
    raise exception 'Workspace access denied';
  end if;
  if jsonb_typeof(p_campaigns) <> 'array' or jsonb_typeof(p_leads) <> 'array' then raise exception 'Invalid payload'; end if;
  if jsonb_array_length(p_campaigns)>500 or jsonb_array_length(p_leads)>10000 then raise exception 'Import too large'; end if;
  delete from public.leads where workspace_id=p_workspace_id;
  delete from public.campaigns where workspace_id=p_workspace_id;
  for c in select value from jsonb_array_elements(p_campaigns) loop
    insert into public.campaigns(workspace_id,external_id,campaign_name,platform,spend,impressions,clicks,currency,reporting_start,reporting_end) values
    (p_workspace_id,c->>'id',c->>'campaign_name',c->>'platform',(c->>'spend')::numeric,(c->>'impressions')::bigint,(c->>'clicks')::bigint,coalesce(c->>'currency','ILS'),nullif(c->>'reporting_start','')::date,nullif(c->>'reporting_end','')::date);
  end loop;
  for l in select value from jsonb_array_elements(p_leads) loop
    insert into public.leads(workspace_id,external_id,campaign_external_id,status,revenue,response_minutes,created_at,source_type,currency) values
    (p_workspace_id,l->>'id',l->>'campaign_id',l->>'status',(l->>'revenue')::numeric,(l->>'response_minutes')::numeric,nullif(l->>'created_at','')::timestamptz,nullif(l->>'source_type',''),coalesce(l->>'currency','ILS'));
  end loop;
end;$$;
revoke all on function public.replace_workspace_data(uuid,jsonb,jsonb) from public,anon;
grant execute on function public.replace_workspace_data(uuid,jsonb,jsonb) to authenticated;
