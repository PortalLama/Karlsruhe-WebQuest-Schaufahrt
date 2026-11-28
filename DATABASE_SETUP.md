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


---

## Database V2 – Bilder und PDFs direkt hochladen

**Wichtig:** Die Website ist schon entsprechend programmiert. Die folgende
neue SQL-Migration wurde **noch nicht automatisch in deinem Supabase-Projekt
ausgeführt**. Bis dahin funktionieren die bisherigen Links unverändert;
der Datei-Modus ist absichtlich deaktiviert.

### Schritt 1: Privaten Speicherbereich anlegen

1. Supabase Dashboard → dein Projekt → **Storage**.
2. **New bucket / Create bucket** auswählen.
3. Bucket-Name **exakt \`webquest-materials\`** eingeben.
4. **Public bucket ausgeschaltet lassen** – der Bucket muss **private** sein.
5. Maximale Dateigröße **10 MB**.
6. Erlaubte MIME-Formate:
   - \`application/pdf\`
   - \`image/jpeg\`
   - \`image/png\`
   - \`image/webp\`
7. Speichern.

Ohne private Bucket-Konfiguration lässt sich der Prüfprozess umgehen oder
ein Upload kann fehlschlagen. **Keinen öffentlichen Bucket wählen.**

### Schritt 2: Zusätzliche Datenbankregeln aktivieren

1. Auf GitHub die neue Datei
   [supabase/storage_migration_v2.sql](supabase/storage_migration_v2.sql)
   öffnen und deren gesamten Inhalt kopieren.
2. In Supabase **SQL Editor → New query** öffnen.
3. SQL einfügen und **Run** auswählen.
4. Es muss eine erfolgreiche Ausführung ohne Fehlermeldung angezeigt werden.

**Hinweis zu SQL-Parserfehlern:** Die Migration verwendet für das erstmalige
Anlegen der Spalte `storage_path` bewusst `ADD COLUMN storage_path text`
ohne `IF NOT EXISTS`, weil manche SQL-Parser diese optionale PostgreSQL-
Syntax nicht verstehen. Deshalb die V2-Migration **nur einmal vollständig**
ausführen. Wenn die Spalte bereits existiert, nicht erneut ausführen, sondern
zuerst den tatsächlichen Tabellenstatus im Table Editor überprüfen. Die
Migration gehört in **SQL Editor → New query**, nicht in den Policy-Editor
unter Storage.

Die Migration ergänzt das bestehende Materialarchiv um \`storage_path\`,
macht \`material_url\` für Datei-Einträge optional und erstellt RLS-Richtlinien
für den privaten Dateispeicher. **Die vorhandenen Links, Metadaten,
Anmeldungen und Freigaben bleiben erhalten.**

### Schritt 3: Testupload

1. Die [Database](database.html) öffnen (ggf. Strg+F5).
2. Mit dem Projektkonto anmelden.
3. **+ Material hinzufügen** anklicken.
4. **Datei direkt hochladen** wählen.
5. Ein unkritisches eigenes Testbild oder eine selbst erstellte PDF
   mit **höchstens 10 MB** wählen.
6. Titel, Station, Fundstelle und quellenkritische Beschreibung ausfüllen.
7. **Zur Prüfung einreichen**.
8. Unter **Anzeige → Meine Einreichungen** den neuen Datensatz prüfen.
9. Das Material sollte als **Zur Prüfung eingereicht** erscheinen;
   die Datei kann vom einreichenden Konto angesehen werden.
10. Als Administrator im Supabase **Table Editor** die Tabelle
    \`public.research_materials\` öffnen und in der Zeile des Materials
    \`review_status\` von \`pending\` auf \`approved\` ändern.
11. In einem privaten Browserfenster ohne Anmeldung prüfen, ob die
    Datei über die freigegebene Quellenkarte geöffnet werden kann.

Bilder erhalten eine Vorschau im Detailfenster; PDFs lassen sich von dort
in einem neuen Browsertab öffnen. Die Dateien werden über **zeitlich
begrenzte, signierte URLs** ausgeliefert, statt als öffentliche Dateien
im Bucket zu liegen. Die URLs gelten jeweils rund 2 Minuten und können
durch erneutes Öffnen der Details neu erstellt werden.

### Welche Dateien gehen?

- PDF, JPG/JPEG, PNG, WebP; maximal 10 MB.
- Kein direkter Video-/Audio-Upload.
- Die Website prüft Dateisignatur, Dateiendung und Größe.
- Zusätzlich müssen Dateigröße und MIME-Typ **im privaten Supabase-Bucket**
  eingeschränkt sein. Diese Client-Prüfung allein bietet keine Sicherheit.
- Dateien können nach Einreichung nicht direkt ausgetauscht werden; ein
  noch nicht freigegebener Beitrag kann gelöscht und neu erstellt werden.
- **Speichert keine Schülernamen, privaten Fotografien oder unrechtmäßig
  kopierten Archivquellen**.

### Wenn etwas nicht funktioniert

| Problem | Prüfung |
| --- | --- |
| „Datei direkt hochladen“ ist grau | \`storage_path\` ist noch nicht verfügbar; Migration im SQL Editor durchführen und Seite aktualisieren |
| Upload: „Bucket not found“ | Bucket exakt \`webquest-materials\` erstellen |
| Fehler 403 / „row-level security“ | Projektkonto angemeldet? SQL-Migration vollständig ausgeführt? Bucket privat und richtig benannt? |
| MIME-/Größenfehler | PDF/JPEG/PNG/WebP und höchstens 10 MB; erlaubte MIME-Typen und Limit im Bucket prüfen |
| Datei sichtbar im Account, aber nicht öffentlich | Datensatz erst im Dashboard auf \`approved\` setzen |
| Link nach einiger Zeit ungültig | Detailansicht erneut öffnen: signierte URLs laufen bewusst ab |
| Alte Materialien weiterhin sichtbar, Datei-Modus aber deaktiviert | Das ist beabsichtigte Abwärtskompatibilität, solange die Migration fehlt |

### Was noch fehlt?

- Automatische Viren-/Malware-Prüfung von Uploads.
- Eine eigene Lehrkraft-Freigabeoberfläche außerhalb des Supabase-Dashboards.
- Anonyme Gruppen-Accounts / schuldatenschutzrechtlich geprüfte Identitäten.
- Automatische Übernahme freigegebener Dateien in die Kartenstationen.
- Versionierung, automatisches Backup und langfristige Archivierung.
- Genaue Rechteprüfung historischer Scans und Fotomaterialien.

Für den produktiven Einsatz mit Minderjährigen muss der Datenschutz mit
der Schule abgestimmt werden. Supabase läuft nicht automatisch in einer
für die Schule zulässigen Datenverarbeitungskonfiguration.

**Technik:** [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control) ·
[Private Buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets) ·
[Signierte Downloads](https://supabase.com/docs/guides/storage/serving/downloads)


---

## Database V3 – Gegenwartsmaterialien getrennt von historischen Quellen

Für die neue WebQuest-Erweiterung **„Gegner oder Feind? – 1933 und heute“**
gibt es unter den Kartenstationen einen dritten Reiter **„Heute“**.
Neue Materialien zu politischer Gewalt, Demonstrationen und politischer
Streitkultur sollen von historischen Quellen unterscheidbar bleiben.

### Einmalige Änderung in Supabase

**Die Website ist bereits programmiert. Diese Datenbank-Migration muss
noch manuell im bestehenden Projekt ausgeführt werden.**

1. [supabase/gegenwart_migration_v3.sql](supabase/gegenwart_migration_v3.sql)
   öffnen und den vollständigen SQL-Text kopieren.
2. Supabase → bestehendes WebQuest-Projekt → **SQL Editor → New query**.
3. SQL einfügen, **Run** auswählen. Es sollte ohne Fehler durchlaufen.
4. Database-Seite aktualisieren. Nun ist die Materialart
   **„Gegenwartsmaterial“** bei Filtern und im Einreichungsformular verfügbar.
5. Als Test einen Gegenwartslink (z. B. bpb-Artikel zum Angriff auf
   Matthias Ecke) einer der vier Stationen zuordnen und einreichen.
6. Im Supabase **Table Editor** wie gewohnt \`review_status\` von
   \`pending\` auf \`approved\` setzen.
7. Auf der historischen Karte die Station auswählen → **„Heute“**
   öffnen → der Link erscheint unter den zusätzlichen geprüften
   Gegenwartsmaterialien. Unter **„Entdecken“** erscheinen weiterhin
   nur die historischen Quellen.

### Wichtige didaktische Hinweise

- Materialart = **Gegenwartsmaterial**. Historische Originalquellen gehören
  weiterhin in die entsprechenden historischen Kategorien.
- Für den Gegenwartsvergleich immer **Titel, Datum, Urheber/Fundstelle**
  und Perspektive des Berichts notieren.
- Die Fälle 2024 sind bewusst feste, überprüfbare Beispiele und kein
  automatisch aktueller Nachrichtenfeed. Vor dem Unterricht auf
  Aktualität prüfen.
- Schülerantworten im Reiter „Heute“ werden **nur im bisherigen lokalen
  Browser-Speicher** abgelegt, nicht in Supabase übertragen. Der
  bestehende Export enthält die neuen Antwortfelder.
- Keine Gleichsetzung: Die NS-Schaufahrt war **staatlich organisierte
  politische Verfolgung**; Gewalt durch einzelne Täter in einem heutigen
  Rechtsstaat muss von Behörden verfolgt werden. Die Gegenwartsanalyse
  dient der begründeten Differenzierung.

### Ausgewählte Gegenwartsquellen

- [bpb: Angriff auf Matthias Ecke (2024)](https://www.bpb.de/kurz-knapp/taegliche-dosis-politik/548158/angriff-auf-spd-politiker-matthias-ecke/)
- [Deutschlandfunk: Demonstrationen nach dem Angriff (05.05.2024)](https://www.deutschlandfunk.de/demonstrationen-fuer-demokratie-und-gegen-gewalt-nach-angriff-gegen-spd-europaabgeordneten-102.html)
- [bpb: Politische Beredsamkeit und Streitkultur](https://www.bpb.de/shop/zeitschriften/apuz/148218/mitreden-koennen-die-bedeutung-der-politischen-beredsamkeit-in-der-demokratie/)
- [Deutscher Bundestag: Grundgesetz](https://www.bundestag.de/parlament/aufgaben/rechtsgrundlagen/grundgesetz)
- [bpb: Beutelsbacher Konsens](https://www.bpb.de/die-bpb/ueber-uns/auftrag/51310/beutelsbacher-konsens/)

