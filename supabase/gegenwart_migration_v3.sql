-- Database V3 · Gegenwartsmaterial als eigene Materialart
-- Im EXISTIERENDEN Supabase-Projekt einmal unter SQL Editor -> New query ausführen.
-- Bestehende Quellen/Links/PDFs bleiben erhalten.
-- Erweitert nur die erlaubten Materialarten, keine neue Tabelle und kein neuer Bucket.

begin;

alter table public.research_materials
  drop constraint if exists research_materials_kind_check;

alter table public.research_materials
  add constraint research_materials_kind_check check (
    kind in ('quelle','darstellung','bild','video','link','gegenwart')
  );

commit;

-- Test: neue Materialart erlaubt, bestehende Daten unverändert:
-- select kind, count(*) from public.research_materials group by kind order by kind;
--
-- Gegenwartsmaterialien werden weiterhin über review_status='approved'
-- freigegeben und sind erst dann öffentlich sichtbar.
-- Bevorzugt eine Station auswählen. Kein Video-Upload erforderlich:
-- Links zu verlässlichen Gegenwartsdarstellungen reichen aus.
