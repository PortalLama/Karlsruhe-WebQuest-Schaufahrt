# Database V1 einrichten · Karlsruhe WebQuest

Die WebQuest bleibt auf GitHub Pages. **Supabase** übernimmt die zentrale
Datenbank und den Login. Die Database-Seite ist bereits als Benutzeroberfläche
implementiert. Ohne Verbindung zeigt sie ausdrücklich den **Vorbereitungsmodus**;
es werden keine echten Materialien gespeichert.

## 1. Supabase-Projekt erstellen

1. Ein eigenes Projekt bei [Supabase](https://supabase.com/dashboard) erstellen.
2. Projektname z. B. \`karlsruhe-schaufahrt\`; ein sicheres Projektpasswort wählen,
   das **nicht** auf GitHub veröffentlicht wird.
3. Das Projekt öffnen und **SQL Editor** aufrufen.
4. Den Inhalt von [supabase/schema.sql](supabase/schema.sql) in den SQL Editor
   kopieren, ausführen und auf Fehler prüfen.

Das SQL erstellt die Tabelle \`public.research_materials\`, alle benötigten
Feldprüfungen, Indizes sowie **Row Level Security (RLS)**.

## 2. Freigabekonten einrichten

1. Unter **Authentication** die öffentliche/neue Registrierung deaktivieren,
   damit nicht jeder Besucher ein Konto selbst anlegen kann.
2. Ein oder mehrere **Projektkonten** mit E-Mail-Adresse und Passwort über das
   Admin-Dashboard anlegen. Diese Konten sollten nur im vereinbarten Unterrichts-
   und Datenschutzrahmen verwendet werden.
3. Zugangsdaten **nicht** in den HTML-/JS-Dateien speichern und nicht im
   Repository ablegen.

Die Website zeigt nur ein Anmeldeformular. **Keine öffentliche Registrierung.**
Ohne Anmeldung sieht man später alle **freigegebenen** Materialien.
Nach Anmeldung sieht man zusätzlich die **eigenen Einreichungen**.

**Wichtig:** Für einen echten Schuleinsatz mit Minderjährigen braucht es die
Freigabe der Schule, Datenschutzprüfung, geeignete Projektkonten und klare
Regeln zu personenbezogenen Daten. Diese Version ist für einen betreuten
Prototypentest gedacht, nicht als schulisch zertifizierter Dienst.

## 3. Öffentliche Projektkonfiguration ergänzen

Im Supabase Dashboard die **Project URL** und einen **Publishable API Key**
der Form \`sb_publishable_...\` suchen.

In [supabase-config.js](supabase-config.js) die leeren Werte ersetzen:

\`\`\`js
window.WEBQUEST_DB_CONFIG = Object.freeze({
  url: "https://DEIN-PROJEKT.supabase.co",
  publishableKey: "sb_publishable_DEIN_OEFFENTLICHER_KEY"
});
\`\`\`

**Nur Publishable Key!** Das ist ein ausdrücklich für Browser vorgesehener
öffentlicher Schlüssel, **kein geheimes Administratorpasswort**. Der Schutz
der Daten geschieht über Auth + RLS. Ein \`sb_secret_...\`-, \`service_role\`-
oder Datenbank-Passwort darf **niemals** in öffentliche GitHub-Dateien!

Die Seite \`database.html\` neu öffnen oder Strg+F5 drücken.

## 4. Testablauf

1. \`database.html\` zeigt: „Gemeinsames Forschungsarchiv verbunden“.
2. Mit dem eingerichteten Testkonto anmelden.
3. Über „+ Material hinzufügen“ einen **öffentlichen HTTPS-Link**
   mit Titel, Quellenangabe, Beschreibung und Station speichern.
4. Der Fund erscheint bei „Meine Einreichungen“ mit Status
   „Zur Prüfung eingereicht“.
5. Im privaten Browserfenster bleibt er zunächst **unsichtbar**.
6. Als Projektadministrator im geschützten Supabase SQL Editor prüfen:

\`\`\`sql
select id, title, source_reference, material_url, review_status
from public.research_materials
where review_status = 'pending'
order by created_at desc;
\`\`\`

7. Die ID des geprüften Materials übernehmen und freigeben:

\`\`\`sql
update public.research_materials
set review_status = 'approved'
where id = 'HIER-DIE-TATSAECHLICHE-UUID-EINSETZEN'
  and review_status = 'pending';
\`\`\`

8. In der Website „Aktualisieren“ wählen. Nun sehen auch nicht
   angemeldete Besucher das freigegebene Material.

**Einträge mit \`pending\` können nur von ihren Verfassern bearbeitet oder
gelöscht werden.** Freigegebene Einträge sind für alle sichtbar, aber nicht
mehr über die Benutzeroberfläche bearbeitbar. Freigabe und Korrekturen nach
Freigabe erfolgen derzeit nur über das geschützte Dashboard.

## Materialarten und Metadaten

- Historische Quelle
- Historische Darstellung
- Bild/Fotografie (als Link)
- Video/Audio (als Link)
- Weiterführender Link

Zu jedem Eintrag gehören Titel, Materialart, optionale Station, Fundstelle,
Beschreibung und HTTPS-Link; Urheber und Entstehungszeit sind ergänzbar.

Noch **nicht** implementiert: direkter Datei-/Bild-/PDF-Upload, automatische
Quellenübernahme in Kartenstationen, sichere Gruppenbearbeitung, geschütztes
Lehrkraft-Freigabeformular, Versionsverlauf, automatisches Backup oder KI.

## Sicherung und Dauerhaftigkeit

Cloud-Speicherung ist zentral, aber keine Garantie gegen Löschung, Sperrung
oder Pausierung kostenloser Projekte. Die Projektverantwortlichen müssen
regelmäßig **eigene Exporte der Tabelle** und der späteren Dateien sichern.
Unabhängige Offline-Kopien sind für einen langfristigen Rundgang wichtig.
Externe Links können sich ändern oder verschwinden. Vor dem Übernehmen
historischer Scans sind Urheber- und Nutzungsrechte zu prüfen.

## Technische Quellen

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API-Schlüssel](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase JavaScript](https://supabase.com/docs/reference/javascript/installing)
- [Supabase Login](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
