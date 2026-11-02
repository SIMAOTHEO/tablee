-- Tablée · partage entre appareils (Supabase, projet gratuit)
-- À coller tel quel dans Supabase → SQL Editor → Run. Une seule fois par projet.

create table if not exists public.tablee_docs (
  foyer      text        not null,
  path       text        not null,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (foyer, path)
);

alter table public.tablee_docs enable row level security;

-- Accès avec la clé « anon » de l'appli : lecture/écriture de la table.
-- Le projet n'est utilisé que par la famille ; le code de partage (qui contient la clé) ne se diffuse pas en dehors.
drop policy if exists "tablee lecture"  on public.tablee_docs;
drop policy if exists "tablee insertion" on public.tablee_docs;
drop policy if exists "tablee maj"      on public.tablee_docs;
create policy "tablee lecture"   on public.tablee_docs for select to anon, authenticated using (true);
create policy "tablee insertion" on public.tablee_docs for insert to anon, authenticated with check (true);
create policy "tablee maj"       on public.tablee_docs for update to anon, authenticated using (true) with check (true);

-- Temps réel : les autres appareils voient les changements sans recharger.
alter publication supabase_realtime add table public.tablee_docs;
