# Karlsruhe 1933 · WebQuest „Gegner oder Feind?“

Ein **didaktischer Prototyp** für Geschichte Klasse 9/10. Der Auftrag der Stadt Karlsruhe ist ausdrücklich **fiktiv**. Die historischen Ereignisse und Materialien werden von der Stadtarchiv-Dokumentation ausgehend aufgearbeitet.

## Website – sechs Unterseiten

1. **[Startseite](index.html)** – Einführung und Überblick über den Projektweg.
2. **[Der Auftrag](auftrag.html)** – fiktiver Projektauftrag und vier selbst wählbare Teamrollen.
3. **[Historische Karte](karte.html)** – interaktive Leaflet-Karte mit vier Stationen, Materiallinks und Bearbeitungsfeldern.
4. **[Database](database.html)** – **vorerst nur ein Platzhalter** für eine spätere gemeinsame Quellen-, Link- und Dateisammlung. Es gibt noch keine Uploadfunktion.
5. **[Methodenkoffer](methodenkoffer.html)** – Quellenkritik, Argumentationsgerüst, Kooperation, Gestaltung und Feedback; Jean-Claude bislang nur als festes Hilfekonzept.
6. **[Erinnerungsrundgang](erinnerungsrundgang.html)** – Vorschau für die später freigegebenen vier Gruppenprodukte. Noch keine automatische Veröffentlichung.

Die Navigation funktioniert über eigenständige HTML-Dateien, nicht über Scroll-Anker. Alle Seiten nutzen `styles.css`. Nur `karte.html` lädt zusätzlich Leaflet und `app.js`.

## Aktueller Funktionsumfang und Grenzen

- Vier historische Lernstationen; anklickbare Marker und Materialkarten.
- Bearbeitbare Notizfelder sowie Links zu externen Quellen/Medien.
- Eingaben werden **nur im jeweiligen Browser** über `localStorage` gespeichert. Sie sind nicht synchronisiert und gehen beim Löschen von Browserdaten verloren; JSON-Export ist möglich.
- Keine Anmeldung, keine gemeinsame Datenbank, kein direkter Dateiupload und noch keine Lehrkraft-Freigabe.
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
