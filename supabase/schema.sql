-- ==================================================================
-- FONDUE FLAME — database schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: every statement is guarded.
-- ==================================================================

-- ---------- stockists ----------------------------------------------
create table if not exists public.stockists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  street      text not null,
  town        text not null,
  postcode    text not null,
  phone       text,
  region      text not null default 'Other',
  website     text,
  published   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- leads (wholesale enquiries) ----------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  business_name text,
  phone         text,
  business_type text,
  website       text,
  message       text,
  status        text not null default 'new',   -- new | contacted | archived
  created_at    timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists stockists_sort_idx  on public.stockists (sort_order, name);

-- ---------- row level security -------------------------------------
alter table public.stockists enable row level security;
alter table public.leads     enable row level security;

-- Stockists: anyone may read the published ones; only a signed-in
-- admin may change them.
drop policy if exists "stockists public read" on public.stockists;
create policy "stockists public read"
  on public.stockists for select
  using (published = true);

drop policy if exists "stockists admin read" on public.stockists;
create policy "stockists admin read"
  on public.stockists for select
  to authenticated using (true);

drop policy if exists "stockists admin write" on public.stockists;
create policy "stockists admin write"
  on public.stockists for all
  to authenticated using (true) with check (true);

-- Leads: nobody reads them except a signed-in admin. Inserts come from
-- the server using the secret key, which bypasses RLS, so there is no
-- public insert policy here — that stops the form endpoint being used
-- to write arbitrary rows straight from a browser.
drop policy if exists "leads admin read" on public.leads;
create policy "leads admin read"
  on public.leads for select
  to authenticated using (true);

drop policy if exists "leads admin update" on public.leads;
create policy "leads admin update"
  on public.leads for update
  to authenticated using (true) with check (true);

drop policy if exists "leads admin delete" on public.leads;
create policy "leads admin delete"
  on public.leads for delete
  to authenticated using (true);

-- ---------- demo stockists -----------------------------------------
-- Seed rows so the dashboard has something to show. The admin can
-- delete these and add real shops. Phone numbers use Ofcom's reserved
-- fictional range (01632 960xxx), which never connects to a real line.
insert into public.stockists (name, street, town, postcode, phone, region, sort_order)
select * from (values
  ('Example Fine Foods',    '00 Placeholder Street', 'London',     'SW0 0AA', '01632 960111', 'London & the South East', 1),
  ('Sample Delicatessen',   '00 Example Lane',       'Brighton',   'BN0 0AA', '01632 960222', 'London & the South East', 2),
  ('Placeholder Pantry',    '00 Sample Road',        'Bristol',    'BS0 0AA', '01632 960333', 'The South West',          3),
  ('Example Gift Company',  '00 Placeholder Way',    'Birmingham', 'B0 0AA',  '01632 960444', 'The Midlands',            4),
  ('Sample Home & Living',  '00 Example Street',     'Manchester', 'M0 0AA',  '01632 960555', 'The North',               5),
  ('Placeholder Provisions','00 Sample Parade',      'Leeds',      'LS0 0AA', '01632 960666', 'The North',               6),
  ('Example Trading Post',  '00 Placeholder Close',  'Edinburgh',  'EH0 0AA', '01632 960777', 'Scotland, Wales & NI',    7)
) as seed(name, street, town, postcode, phone, region, sort_order)
where not exists (select 1 from public.stockists);
