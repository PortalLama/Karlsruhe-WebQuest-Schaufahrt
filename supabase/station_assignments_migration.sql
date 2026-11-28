-- Karlsruhe WebQuest · Stationen ohne Doppelbelegung
-- Einmalig im bestehenden Supabase-Projekt ausführen:
-- SQL Editor -> New query -> gesamten Text einfügen -> Run.
--
-- Anmeldung: bestehende Supabase-Auth-Konten (ein Projektkonto pro Gruppe).
-- Leser sehen nur die Gruppennamen, nie E-Mail-Adressen oder Passwörter.
-- Zwei Gruppen können nicht dieselbe Station übernehmen:
-- station_id ist PRIMARY KEY (atomar, auch bei gleichzeitigem Klicken).
-- Ein Konto kann nicht mehrere Stationen übernehmen: owner_id UNIQUE.
--
-- Nur neutrale Gruppennamen wie "Gruppe A" oder "Team Rot" eingeben.
-- Die Gruppennamen sind auf der öffentlichen Karte für alle sichtbar.

begin;

create table if not exists public.station_assignments (
  station_id smallint primary key check (station_id between 1 and 4),
  group_name text not null
    check (
      char_length(btrim(group_name)) between 3 and 32
      and group_name = btrim(group_name)
      and group_name ~ '^[[:alnum:] ._-]+$'
    ),
  owner_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade unique,
  claimed_at timestamptz not null default now()
);

alter table public.station_assignments enable row level security;

-- Zugriff auf sensible Konten-IDs ist auf angemeldete Konten begrenzt.
-- Ohne Anmeldung dürfen Besucher nur Nummer und Gruppennamen lesen.
revoke all on public.station_assignments from anon, authenticated;
grant select (station_id, group_name) on public.station_assignments to anon;
grant select (station_id, group_name, owner_id) on public.station_assignments to authenticated;

-- Eigentümer-ID und Zeitstempel werden NUR von der Datenbank gesetzt.
grant insert (station_id, group_name) on public.station_assignments to authenticated;
grant delete on public.station_assignments to authenticated;

drop policy if exists "Anyone can see station assignment names" on public.station_assignments;
create policy "Anyone can see station assignment names"
  on public.station_assignments
  for select to anon, authenticated using (true);

drop policy if exists "Group account can claim its own station" on public.station_assignments;
create policy "Group account can claim its own station"
  on public.station_assignments
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Group account can release its own station" on public.station_assignments;
create policy "Group account can release its own station"
  on public.station_assignments
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Kein UPDATE: Nachträgliche Übernahme eines fremden Eintrags ist verboten.
-- Ein Gruppenwechsel erfolgt durch Aufheben und erneutes Übernehmen.
-- Lehrkräfte können die Einträge im GESCHÜTZTEN Supabase Table Editor verwalten.
commit;

-- Im Table Editor: public -> station_assignments.
-- Prüfung, ob eine Doppelbuchung verhindert wird:
-- PRIMARY KEY (station_id) + UNIQUE (owner_id).
-- Bestehende Tabellen research_materials und Storage-Dateien bleiben unverändert.
