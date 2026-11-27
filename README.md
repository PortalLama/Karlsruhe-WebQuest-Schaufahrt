# Karlsruhe 1933 · WebQuest „Gegner oder Feind?“

Ein **didaktischer Prototyp** für Geschichte Klasse 9/10. Der Auftrag der Stadt Karlsruhe ist ausdrücklich **fiktiv**. Die historischen Ereignisse und Materialien werden von der Stadtarchiv-Dokumentation ausgehend aufgearbeitet.

## Website – sechs Unterseiten

1. **[Startseite](index.html)** – Einführung und Überblick über den Projektweg.
2. **[Der Auftrag](auftrag.html)** – fiktiver Projektauftrag und vier selbst wählbare Teamrollen.
3. **[Historische Karte](karte.html)** – interaktive Leaflet-Karte mit vier Stationen, Materiallinks und Bearbeitungsfeldern.
4. **[Database](database.html)** – gemeinsame Quellen- und Linkverwaltung mit Suche, Stationsfiltern, Anmeldung, Einreichung und Freigabeprozess. **V2 ergänzt direkte private Uploads von PDF-/Bilddateien**, die erst nach Einrichten des Buckets und Ausführen der [Storage-Migration](supabase/storage_migration_v2.sql) aktiviert werden.
5. **[Methodenkoffer](methodenkoffer.html)** – Quellenkritik, Argumentationsgerüst, Kooperation, Gestaltung und Feedback; Jean-Claude bislang nur als festes Hilfekonzept.
6. **[Erinnerungsrundgang](erinnerungsrundgang.html)** – Vorschau für die später freigegebenen vier Gruppenprodukte. Noch keine automatische Veröffentlichung.

Die Navigation funktioniert über eigenständige HTML-Dateien, nicht über Scroll-Anker. Alle Seiten nutzen `styles.css`. `karte.html` lädt zusätzlich Leaflet, den öffentlichen Supabase-Client, `supabase-config.js` und `app.js`; `database.html` bindet denselben Supabase-Client, `supabase-config.js` und `database.js` ein.

**Database einrichten:** [DATABASE_SETUP.md](DATABASE_SETUP.md) beschreibt den Supabase-Login, Quellenfreigaben und ab V2 den **privaten Bucket `webquest-materials` sowie die neue SQL-Migration**. Bestehende Link-Einträge bleiben funktionsfähig, auch solange die Upload-Migration noch aussteht.

## Kartendesign V2

Die Forschungsseite \`karte.html\` zeigt einen **hellen, farblich reduzierten OpenStreetMap-Hintergrund**. Dazu werden die bisherigen OSM-Kacheln ausschließlich per CSS-Filter dargestellt; es wird kein API-Schlüssel eines zusätzlichen Kartendienstes benötigt. Leaflet und die sichtbare OpenStreetMap-Nennung bleiben bestehen.

**Eigene Erinnerungsmarker:** Vier aufeinander abgestimmte Stele-/Kartenmarker mit SVG-Piktogrammen und den Stationsnummern 01–04:

- Gefängnis Riefstahlstraße: Gitter
- Kanzlei Ludwig Marum: Waage (Rechtsstaat)
- Volksfreund-Redaktion: Zeitung
- Badisches Ständehaus: Säulen (Parlament)

Der gewählte Marker ist rot, die übrigen erscheinen in Creme/Anthrazit.

**Korrigierte Standortpositionen:**

- Riefstahlstraße 9: ungefähr 49.013674, 8.385422 (JVA, Outdooractive)
- Kaiserstraße 176: ungefähr 49.010300, 8.391900 (heutiger Standort, Limehome/OSM)
- Waldstraße 28: **noch näherungsweise** 49.010650, 8.396950 (Standort anhand Archivplan eingepasst; verifizieren)
- Ständehaus/Friedrichsplatz: ungefähr 49.008757, 8.400328

Die rot gestrichelte Teilstrecke ist eine **näherungsweise Rekonstruktion anhand des historischen Stadtarchivplans**, nicht ein präziser digitalisierter Verlauf. Zwölf Wendepunkte folgen ungefähr dem Straßenverlauf; es ist **keine komplette Fahrt nach Kislau** und kein verifiziertes modernes Fuß-/Autorouting. Eine weitere Abgleichung mit historischer Karte und genauer Georeferenzierung ist vor dem Unterricht sinnvoll.

Archivvorlage: https://stadtgeschichte.karlsruhe.de/erinnerungskultur/erinnerungskultur-im-oeffentlichen-raum/schaufahrt-1933/orte

## Aktueller Funktionsumfang und Grenzen

- Vier historische Lernstationen; anklickbare Marker und Materialkarten.
- Bearbeitbare Notizfelder sowie Links zu externen Quellen/Medien.
- Eingaben werden **nur im jeweiligen Browser** über `localStorage` gespeichert. Sie sind nicht synchronisiert und gehen beim Löschen von Browserdaten verloren; JSON-Export ist möglich.
- Gemeinsame Quellen-/Linkverwaltung mit Supabase-Projektkonten. Direkte PDFs und Bilder erst nach zusätzlichem privatem Bucket und V2-Migration; keine Lehrkraft-Freigabeoberfläche.
- Weder die Database noch der öffentliche Erinnerungsrundgang veröffentlichen aktuell automatisch Gruppenentwürfe.
- Jean-Claude ist noch **kein KI-Chatbot**.
- Die Website sollte vor einem realen Schuleinsatz hinsichtlich Datenschutz, Barrierefreiheit, Quellengenauigkeit und Bildrechten geprüft werden.

## Historische Prüfung vor dem Unterricht

Die Marker sind näherungsweise gesetzt. Die gestrichelte Linie verbindet **nur vier ausgewählte Lernorte schematisch** – sie ist **nicht** der authentische Straßenverlauf der gesamten Schaufahrt. Der Weg führte über weitere Orte und schließlich nach Kislau. Vor dem Unterricht sollten Orte, Streckenverlauf und Quellen mit der Archivdokumentation abgeglichen werden.

**Referenz:** [Stadtarchiv Karlsruhe: Orte der Schaufahrt](https://stadtgeschichte.karlsruhe.de/erinnerungskultur/erinnerungskultur-im-oeffentlichen-raum/schaufahrt-1933/orte)

Historische Originalscans sind noch nicht eingebettet. Die gegenwärtigen Materialkacheln verlinken auf Einstiegs- und Kontextmaterial. NS-Propaganda muss als Täterperspektive kontextualisiert und durch weitere Quellen kontrastiert werden.

## GitHub Pages

Unter **Settings → Pages → Build and deployment** ist `Deploy from a branch`, Branch `main`, Ordner `/(root)` auszuwählen.

Vorgesehene öffentliche Website:
https://portallama.github.io/Karlsruhe-WebQuest-Schaufahrt/

Das Hosting liefert die einzelnen HTML-Seiten über dieselbe Adresse aus. Nach Änderungen kann die Aktualisierung eine kurze Zeit benötigen.

## Lokal testen

Im Projektordner `python -m http.server 8000` starten und `http://localhost:8000` öffnen. Die Karte erfordert zum Laden von Leaflet und OpenStreetMap-Tiles eine Internetverbindung.

## Nächste technische Aufgaben

1. Vier Stationen mit tatsächlich geprüften Archivmaterialien und genauer historischer Route versehen.
2. Die Database als geschützte Sammlung planen: Datenmodell, Quellen-Metadaten, Uploads/Links, Rechte und Sichtbarkeit.
3. Gruppenbezogene Authentifizierung und gemeinsame Speicherung, z. B. über ein geeignetes Backend wie Supabase, prüfen.
4. Arbeitskarte und öffentlich freigegebenen Erinnerungsrundgang sauber voneinander trennen.
5. Medienvorlagen, Peerfeedback und gegebenenfalls KI-Hilfen nach schulischer Freigabe ergänzen.

## Technik

- Statisches HTML, CSS, JavaScript – kein Build-Schritt.
- [Leaflet](https://leafletjs.com/) und [OpenStreetMap](https://www.openstreetmap.org/) für die Karte.
- Öffentliches Repository: **keine Zugangsdaten, API-Schlüssel, personenbezogenen Schülerdaten oder unveröffentlichten Archivscans hochladen.**
- Derzeit keine Open-Source-Lizenz festgelegt; Rechte historischer Materialien sind getrennt zu klären.

## Forschungsstationen V3 · automatische Database-Verknüpfung

Die **Historische Karte** liest ausschließlich **freigegebene** Einträge aus
\`public.research_materials\` über den öffentlichen Supabase-Publishable-Key.
Dafür ist **keine zusätzliche SQL-Migration und keine neue Tabelle** nötig.
Die bereits aktiven RLS-Regeln geben anonymen Besuchern nur Einträge mit
\`review_status = 'approved'\` frei.

- \`station = 1\` → Gefängnis Riefstahlstraße
- \`station = 2\` → Kanzlei Ludwig Marum
- \`station = 3\` → Volksfreund-Redaktion
- \`station = 4\` → Badisches Ständehaus
- \`station = NULL\` → übergreifende Materialien bleiben in der **Database**;
  sie werden bewusst keiner konkreten Station automatisch zugeordnet.

Auf \`karte.html\` zeigt **Entdecken → Welche Materialien gibt es?**
zuerst das bisherige Quellenpaket und die lokal ergänzten Quellenlinks.
Danach erscheint **Freigegebene Materialien aus der Database** mit Titel,
Materialart und einzelnen anklickbaren Quellkarten. Es werden nur maximal
250 neueste freigegebene stationsgebundene Einträge geladen.

- Externe Links öffnen die Originalfundstelle.
- Bilder und PDFs im privaten Bucket \`webquest-materials\` werden bei
  Klick über eine **zwei Minuten gültige signierte URL** abgerufen. Bilder
  zeigen eine Vorschau, PDFs einen Öffnen-Link.
- Bei Fehlern bleibt das ursprüngliche Quellenpaket verfügbar; die Karte
  erfordert nicht, dass die Datenbank erreichbar ist.
- „↻ Aktualisieren“ ruft neue freigegebene Einträge ab; nach Wechsel
  zurück zum Browser-Tab wird die Liste bei Bedarf automatisch erneuert.
- Der Database-Link aus einer Station filtert \`database.html?station=N\`
  und übernimmt die Station bei neu eingereichten Materialien.

**Wichtig:** Individuelle Forschungsnotizen auf der Karte bleiben
\`localStorage\` und werden **nicht** automatisch mit anderen Geräten
synchronisiert. Die Quellenverknüpfung ist zunächst nur lesend.
Der Freigabeprozess bleibt im Supabase Table Editor.

**Test:** Material zu Station 03 hochladen oder verlinken → Status
\`pending\` überprüfen (auf Karte nicht sichtbar) → im Table Editor
\`approved\` setzen → Karte öffnen und „↻ Aktualisieren“ klicken →
Material erscheint nur unter Station 03. Privatfenster prüft den
anonymen Zugriff auf freigegebene Dateien. Alte Einträge bleiben
erhalten.

## Database V2 · Sicherheit bei Datei-Uploads

- Nur PDF, JPEG, PNG und WebP, max. 10 MB je Datei.
- Private Supabase-Storage-Bucket mit RLS: Einreichung durch angemeldetes Projektkonto, Ansicht zunächst nur für Eigentümer, Freigabe wie bisher im Supabase-Dashboard.
- Freigegebene Bilder erhalten eine Vorschau; PDFs sind über kurzlebige signierte Downloadlinks zugänglich.
- **Nicht** automatisch ausgerollt: Die Datenbankmigration aus [supabase/storage_migration_v2.sql](supabase/storage_migration_v2.sql) muss im existierenden Supabase-Projekt noch durch die Projektverantwortlichen ausgeführt werden.
- Eine zentrale Speicherung ersetzt keine Sicherungskopien und keine Datenschutz-/Urheberrechtsprüfung.
