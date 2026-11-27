-- Karlsruher WebQuest · Database V1
-- Sicheres Grundschema für Links und Quellenmetadaten.
-- Noch keine Datei-Uploads, keine Gruppenrollen und keine Lehrkraft-Webansicht.
-- Einrichtung durch Projektverantwortliche im Supabase SQL Editor.
--
-- Sicherheitsmodell:
-- 1) Öffentlich: nur freigegebene Materialien LESEN.
-- 2) Angemeldete Accounts: eigene, zunächst ungeprüfte Materialien erstellen,
--    selbst bearbeiten und löschen, solange sie "pending" sind.
-- 3) Nur Projektadministration im Supabase-Dashboard kann Freigaben ändern.
-- 4) Keine personenbezogenen Schülerdaten in Titel/Beschreibung/Fundstelle!
-- 5) Jeder Zugriff aus der Website wird zusätzlich durch RLS abgesichert.

create table if not exists public.research_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 4 and 180),
  kind text not null check (kind in ('quelle', 'darstellung', 'bild', 'video', 'link')),
  station smallint check (station between 1 and 4),
  author text not null default '' check (char_length(author) <= 180),
  historical_date text not null default '' check (char_length(historical_date) <= 80),
  source_reference text not null
    check (char_length(btrim(source_reference)) between 4 and 500),
  description text not null
    check (char_length(btrim(description)) between 10 and 1200),
  material_url text not null
    check (char_length(material_url) <= 1800
       and material_url ~* '^https://[^[:space:]]+$'),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  review_status text not null default 'pending'
    check (review_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists research_materials_station_idx
  on public.research_materials (station);
create index if not exists research_materials_status_created_idx
  on public.research_materials (review_status, created_at desc);
create index if not exists research_materials_owner_idx
  on public.research_materials (owner_id);

-- Aktualisiert die Zeitangabe auch bei einer nachträglichen Bearbeitung.
create or replace function public.set_research_material_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists research_materials_updated_at on public.research_materials;
create trigger research_materials_updated_at
before update on public.research_materials
for each row execute function public.set_research_material_updated_at();

alter table public.research_materials enable row level security;

-- Die API-Berechtigungen begrenzen zusätzlich die Aktionen nach Rolle.
revoke all on table public.research_materials from anon, authenticated;
grant select on table public.research_materials to anon;
grant select, insert, update, delete on table public.research_materials to authenticated;

drop policy if exists "Approved materials are publicly readable" on public.research_materials;
create policy "Approved materials are publicly readable"
on public.research_materials for select
to anon, authenticated
using (review_status = 'approved');

drop policy if exists "Authors can read their submissions" on public.research_materials;
create policy "Authors can read their submissions"
on public.research_materials for select
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Authors can submit only pending materials" on public.research_materials;
create policy "Authors can submit only pending materials"
on public.research_materials for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and review_status = 'pending'
);

drop policy if exists "Authors can edit only pending materials" on public.research_materials;
create policy "Authors can edit only pending materials"
on public.research_materials for update
to authenticated
using (
  owner_id = (select auth.uid())
  and review_status = 'pending'
)
with check (
  owner_id = (select auth.uid())
  and review_status = 'pending'
);

drop policy if exists "Authors can delete only pending materials" on public.research_materials;
create policy "Authors can delete only pending materials"
on public.research_materials for delete
to authenticated
using (
  owner_id = (select auth.uid())
  and review_status = 'pending'
);

-- Freigabe / Ablehnung erfolgt ausschließlich über den geschützten
-- Supabase SQL Editor bzw. später über ein gesichertes Moderations-Backend.
--
-- Beispiel (ID ersetzen):
-- update public.research_materials
-- set review_status = 'approved'
-- where id = '00000000-0000-0000-0000-000000000000';
--
-- Zum Ablehnen:
-- update public.research_materials
-- set review_status = 'rejected'
-- where id = '00000000-0000-0000-0000-000000000000';

-- WICHTIG: Im Dashboard unter Authentication die öffentliche Registrierung
-- deaktivieren und Testaccounts bewusst anlegen. Öffentliche GitHub-Seiten
-- dürfen ausschließlich eine sb_publishable_...-Kennung verwenden,
-- niemals sb_secret_... oder den legacy service_role Schlüssel.
