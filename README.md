# Karlsruhe 1933 · WebQuest „Gegner oder Feind?“

Ein **didaktischer, noch nicht fertiggestellter Prototyp** für eine interaktive Geschichtslern-Website (Klasse 9/10). Das Szenario eines Auftrags der Stadt Karlsruhe ist **fiktiv** und nicht mit einem tatsächlichen Auftrag der Stadt zu verwechseln.

## Stand

- Responsive Startseite mit fiktivem Forschungsauftrag
- Karte mit OpenStreetMap/Leaflet und vier anklickbaren Stationen
- Stationsansichten mit „Wo sind wir?“, „Was ist hier passiert?“, zwei Materialkacheln und Forschungsfragen
- Bearbeitungsansicht mit Quellenbeobachtungen, historischem Erklärungsfeld, Medien- und Quellenlinks
- **Nur lokale Speicherung im Browser** über \`localStorage\`; JSON-Export des Arbeitsstandes
- Methodenkoffer mit Quellencheckliste, Argumentationshilfe, Teamhinweisen und Peerfeedback
- Jean-Claude als **Konzept und feste Hilfe**, **nicht** als angebundene KI

### Historische Prüfung vor dem Unterricht

Die Karte zeigt **ungefähre Positionsmarker**. Die gestrichelte Linie verbindet **nur vier ausgewählte Lernorte schematisch** – sie ist **nicht** der authentische Straßenverlauf der gesamten Schaufahrt. Der tatsächliche Weg führte über weitere Orte und schließlich nach Kislau. Vor dem Unterricht sollten historische Marker, Route, Adressen und konkrete Quellen auf Grundlage der Archivkarte überprüft werden.

**Primärreferenz:** [Stadtarchiv Karlsruhe: Orte der Schaufahrt](https://stadtgeschichte.karlsruhe.de/erinnerungskultur/erinnerungskultur-im-oeffentlichen-raum/schaufahrt-1933/orte)

### Quellen und Nutzungsrechte

Der erste Prototyp verlinkt auf die Stadtarchiv-Dokumentation. Er enthält **noch keine eingebetteten historischen Originalscans**. Titel in den Kacheln sind zunächst Verweise auf Einstiegs- und Kontextmaterial. Für spätere Originale sind Provenienz, Archivsignatur, Bildunterschrift, Quellenkritik, Rechte und Alt-Texte zu ergänzen. NS-Presse muss als Täterperspektive kontextualisiert werden.

## Online veröffentlichen: GitHub Pages

1. Im GitHub-Repository **Settings** öffnen.
2. Unter **Pages** bei **Build and deployment** die Quelle **Deploy from a branch** wählen.
3. Branch **main**, Ordner **/(root)** einstellen und speichern.
4. Die Website erscheint bei aktivierter GitHub-Pages-Veröffentlichung üblicherweise unter:
   \`https://portallama.github.io/Karlsruhe-WebQuest-Schaufahrt/\`
5. Auf dem Smartphone, Laptop und mit Tastatur testen.

Die URL ist erst nach erfolgreichem Pages-Deployment eine nutzbare Website.

## Lokal testen

\`index.html\` in einem aktuellen Browser öffnen (Internetverbindung notwendig für Leaflet und OpenStreetMap). Alternativ im Projektordner einen lokalen Webserver starten, z. B. \`python -m http.server 8000\`, danach \`http://localhost:8000\` öffnen.

## Einschränkungen

- Kein Login und keine synchronisierte Gruppenarbeit: jeder Browser speichert **eigene** Notizen.
- Ohne Export können Notizen bei Löschung der Browserdaten verloren gehen.
- Kein direkter Dateiupload und keine serverseitige Speicherung.
- Lehrkraftfreigabe und Sichtbarkeit von Arbeiten anderer Gruppen sind noch nicht implementiert.
- Keine KI-Anbindung; Jean-Claude enthält bislang lediglich einen Methodenkoffer.
- Für den tatsächlichen Schuleinsatz: Schulfreigaben, Datenschutz, Sicherheit, historische Genauigkeit und Urheberrechte prüfen.
- Der öffentliche GitHub-Code darf **keine Schülerdaten, Zugangsdaten, API-Schlüssel oder nicht freigegebene Archivscans** enthalten.

## Nächste Ausbaustufe (Stufe 2/3)

1. Die vier historischen Stationen mit geprüften Archivmaterialien ausstatten.
2. Die eingezeichnete Linie durch die belegte historische Strecke ersetzen und die genauen Stationen prüfen.
3. Eine schreibgeschützte veröffentlichte Ansicht und einen geschützten Gruppen-Editor trennen.
4. Supabase oder eine andere geeignete Datenbank mit Authentifizierung und Zugriffsregeln anbinden.
5. Externe Medienlinks mit Freigabeprozess einführen und Peerfeedback auf Stationsebene ermöglichen.
6. KI-Assistenten nur nach fachlicher und datenschutzrechtlicher Freigabe anbinden.

## Technik

- Statisches HTML, CSS, JavaScript
- [Leaflet](https://leafletjs.com/) und [OpenStreetMap](https://www.openstreetmap.org/) für die Karte
- Keine installierten JavaScript-Pakete und derzeit kein Build-Schritt

Das Projekt ist ein Seminarkonzept; vorerst ohne Open-Source-Lizenz. Historische Bilder und Dokumente unterliegen unabhängig vom Code ihren jeweiligen Rechten.
