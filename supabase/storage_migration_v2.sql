-- Database V2 · privater Datei-Upload (PDF, JPG, PNG, WebP)
--
-- Migration für die BEREITS FUNKTIONIERENDE V1-Datenbank.
-- Nicht das ursprüngliche Schema erneut ausführen.
--
-- Vorher in Supabase → Storage manuell einen Bucket anlegen:
-- Name: webquest-materials
-- Public bucket: AUS (PRIVATE!)
-- Maximum file size: 10 MB
-- Allowed MIME types:
-- application/pdf, image/jpeg, image/png, image/webp
--
-- Diese Migration konfiguriert keine Buckets per SQL; dafür die Storage-
-- Verwaltung nutzen. Sie ergänzt nur Tabellen-/Objekt-Zugriffsregeln.

begin;

alter table public.research_materials
  add column if not exists storage_path text;

alter table public.research_materials
  alter column material_url drop not null;

-- V1 verlangte immer eine URL. Nun: ENTWEDER eine URL ODER eine Datei.
alter table public.research_materials
  drop constraint if exists research_materials_material_url_check;

alter table public.research_materials
  drop constraint if exists research_materials_location_check;

alter table public.research_materials
  add constraint research_materials_location_check check (
    (
      storage_path is null
      and material_url is not null
      and char_length(material_url) <= 1800
      and material_url ~* '^https://[^[:space:]]+$'
    )
    or
    (
      material_url is null
      and storage_path is not null
      and storage_path ~
        '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png|webp)$'
    )
  );

-- Der Dateipfad darf bei Einreichung angegeben, aber von den
-- Redaktionskonten später NICHT ausgetauscht werden.
grant insert (storage_path) on public.research_materials to authenticated;

-- Bestehende Insert-RLS um Dateipfad-Zugehörigkeit erweitern.
drop policy if exists "Authors can submit only pending materials"
  on public.research_materials;

create policy "Authors can submit only pending materials"
on public.research_materials
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and review_status = 'pending'
  and (
    storage_path is null
    or split_part(storage_path,'/',1) = (select auth.uid()::text)
  )
);

-- Private Dateien dürfen nur durch das eigene Konto oder nach
-- geprüfter Freigabe als zugehöriger Materialeintrag gelesen werden.
drop policy if exists "WebQuest private file read" on storage.objects;
create policy "WebQuest private file read"
on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'webquest-materials'
  and (
    owner_id = (select auth.uid()::text)
    or exists (
      select 1
      from public.research_materials m
      where m.storage_path = storage.objects.name
        and m.review_status = 'approved'
    )
  )
);

-- Einreichende Konten können ausschließlich in ihrem eigenen
-- UUID-Ordner neue Dateien anlegen; Dateinamen sind zufällige UUIDs.
drop policy if exists "WebQuest user file upload" on storage.objects;
create policy "WebQuest user file upload"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'webquest-materials'
  and owner_id = (select auth.uid()::text)
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and name ~
    '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png|webp)$'
);

-- Eigene Dateien können gelöscht werden, sofern KEIN freigegebener
-- Datensatz darauf verweist. Verhindert den Verlust publizierter Scans.
drop policy if exists "WebQuest delete unapproved own file" on storage.objects;
create policy "WebQuest delete unapproved own file"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'webquest-materials'
  and owner_id = (select auth.uid()::text)
  and not exists (
    select 1 from public.research_materials m
    where m.storage_path = storage.objects.name
      and m.review_status = 'approved'
  )
);

-- Keine Storage UPDATE / UPSERT-Policy: keine nachträgliche
-- unkontrollierte Ersetzung bereits freigegebener Materialien.

commit;

-- Kontrolle nach Einrichtung:
-- select column_name, is_nullable from information_schema.columns
-- where table_schema='public' and table_name='research_materials'
--   and column_name in ('material_url','storage_path');
--
-- select id, name, public, file_size_limit, allowed_mime_types
-- from storage.buckets where id='webquest-materials';
--
-- Einträge werden wie zuvor im Dashboard freigegeben:
-- UPDATE public.research_materials
-- SET review_status = 'approved'
-- WHERE id = 'DEINE-MATERIAL-UUID';
--
-- Kein öffentlichen Bucket benutzen, keine Schülerdaten oder
-- ungeklärten Archivscans hochladen. Für Schuleinsatz Datenschutz
-- und Rechte prüfen, außerdem unabhängige Sicherungskopien anlegen.
