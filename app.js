"use strict";

/*
 * Karlsruher WebQuest · Kartenlayout V2
 * Die Streckenführung ist näherungsweise aus dem Archivplan übertragen,
 * jedoch noch keine vermessene oder vollständig gesicherte Fahrtlinie.
 * Die individuellen Bearbeitungsfelder bleiben im Browser (localStorage).
 * Freigegebene Quellen werden ergänzend aus der Supabase-Database geladen.
 */
const ARCHIVE_ROOT = "https://stadtgeschichte.karlsruhe.de/erinnerungskultur/erinnerungskultur-im-oeffentlichen-raum/schaufahrt-1933";
const STATIONS = [
  {
    id:"gefängnis", name:"Gefängnis Riefstahlstraße", short:"Gefängnis", address:"Riefstahlstraße 9, Karlsruhe", coordinates:[49.013674,8.385422],
    where:"Hier befand sich 1933 ein Gefängnis, in dem politische Gegner der Nationalsozialisten festgehalten wurden.",
    happened:"Am 16. Mai 1933 begann die öffentliche Vorführung von sieben inhaftierten Sozialdemokraten. Die Gefangenen wurden auf einem offenen Wagen durch die Stadt gefahren.",
    question:"Welche Bedeutung hatte staatliche Gewalt für den Umgang mit politischen Gegnern?",
    prompts:["Was bedeutete der NS-Begriff „Schutzhaft“?","Welche Rolle spielten Polizei und Behörden?"],
    sources:[
      {label:"Stadtarchiv: Station und Streckenverlauf",kind:"Ortsdokumentation",description:"Einstieg in die historische Dokumentation. Ein konkreter Scan der Haftakte muss noch ergänzt und geprüft werden.",url:ARCHIVE_ROOT+"/orte"},
      {label:"Stadtarchiv: Biografien der Verfolgten",kind:"Biografischer Kontext",description:"Biografische Informationen, etwa zu Gustav Heller. Kein Ersatz für die Quellenanalyse.",url:ARCHIVE_ROOT+"/kurzbiographien"}
    ]
  },
  {
    id:"marum", name:"Kanzlei Ludwig Marum", short:"Kanzlei Marum", address:"Kaiserstraße 176, Karlsruhe", coordinates:[49.010300,8.391900],
    where:"Hier lag die Kanzlei von Ludwig Marum. Er war Rechtsanwalt und sozialdemokratischer Politiker.",
    happened:"Die Nationalsozialisten führten die Gefangenen an Marums Kanzlei vorbei. Marum befand sich selbst unter den sieben öffentlich Vorgeführten.",
    question:"Warum demütigten die Nationalsozialisten politische Gegner öffentlich?",
    prompts:["Weshalb könnte gerade dieser Ort ausgewählt worden sein?","Was erzählen Täter- und Betroffenenquellen jeweils?"],
    sources:[
      {label:"Stadtarchiv: Marums Kanzlei als Station",kind:"Ortsdokumentation",description:"Historische Einordnung des Ortes und der Schaufahrt. Ein Originalfoto wird später als eigener Scan hinterlegt.",url:ARCHIVE_ROOT+"/orte"},
      {label:"Kurzbiografie Ludwig Marum",kind:"Biografischer Kontext",description:"Hinweise zu Marums politischer Tätigkeit und Verfolgung. Briefe aus Kislau sollen als Originalmaterial ergänzt werden.",url:ARCHIVE_ROOT+"/kurzbiographien"}
    ]
  },
  {
    id:"volksfreund", name:"Redaktion des Volksfreund", short:"Volksfreund", address:"Waldstraße 28, Karlsruhe", coordinates:[49.010650,8.396950],
    where:"Hier befanden sich Redaktion und Druckerei der sozialdemokratischen Zeitung „Volksfreund“.",
    happened:"Die Zeitung wurde 1933 verboten. Auch an ihrem ehemaligen Verlagsgebäude führte die Schaufahrt vorbei.",
    question:"Wie entstanden nationalsozialistische Feindbilder über politische Gegner?",
    prompts:["Wie wurden Sozialdemokraten in der NS-Presse bezeichnet?","Was bedeutete das Verbot oppositioneller Zeitungen?"],
    sources:[
      {label:"Stadtarchiv: Volksfreund als Station",kind:"Ortsdokumentation",description:"Kontext zum Gebäude. Ein historischer Zeitungsausschnitt und eine NS-Pressestimme werden später hinzugefügt.",url:ARCHIVE_ROOT+"/orte"},
      {label:"Hintergrund: Schaufahrt 1933",kind:"Historische Darstellung",description:"Einordnung der Schaufahrt durch das Stadtarchiv. Quellenkritisch vom zeitgenössischen Presseartikel unterscheiden.",url:ARCHIVE_ROOT}
    ]
  },
  {
    id:"ständehaus", name:"Badisches Ständehaus", short:"Ständehaus", address:"Friedrichsplatz, Karlsruhe", coordinates:[49.008757,8.400328],
    where:"Das Badische Ständehaus war ein zentraler Ort der parlamentarischen Demokratie in Baden.",
    happened:"Am 16. Mai 1933 trat der nach nationalsozialistischen Vorgaben umgebildete badische Landtag zusammen. Die Schaufahrt führte am Ständehaus vorbei.",
    question:"Welche Botschaft vermittelte die öffentliche Vorführung im Umfeld des Parlaments?",
    prompts:["Weshalb war der 16. Mai 1933 als Datum bedeutsam?","Welche Bedeutung hatte der Ort für die Demokratie?"],
    sources:[
      {label:"Stadtarchiv: Ständehaus auf der Route",kind:"Ortsdokumentation",description:"Beschreibung des historischen Stationsortes. Zeitgenössische Materialien zur Landtagssitzung fehlen im Prototyp noch.",url:ARCHIVE_ROOT+"/orte"},
      {label:"Stadtarchiv: Schaufahrt im historischen Kontext",kind:"Historische Darstellung",description:"Einordnung der politischen Inszenierung. Diese Darstellung ist keine zeitgenössische Originalquelle.",url:ARCHIVE_ROOT}
    ]
  }
];

/*
 * Die Stadtarchivkarte belegt die Stationen und ihre Reihenfolge, liefert aber
 * keine maschinenlesbare Polylinie. Dieses Zwischenstück wird deshalb bewusst
 * als NÄHERUNGSWEISE REKONSTRUKTION gezeigt.
 *
 * Erste Orte laut Stadtarchiv:
 * 1. Riefstahlstraße 9 (Gefängnis)
 * 2. Kaiserstraße 176 (Kanzlei Marum)
 * 3. Waldstraße 28 (Volksfreund)
 * 4. Friedrichsplatz (Ständehaus)
 *
 * Die Schaufahrt führte danach an weiteren demokratischen Institutionen vorbei
 * und endete im KZ Kislau. Die vier Stationen sind kein vollständiger Rundweg.
 *
 * Koordinaten der Haltepunkte:
 * JVA-Karlsruhe 49.013674, 8.385422 (Outdooractive);
 * Kanzlei Kaiserstraße 176 ca. 49.0103, 8.3919 (Limehome/OSM);
 * Volksfreund Waldstraße 28: geographische Annäherung an die Archivposition;
 * Ständehaus ca. 49.008757, 8.400328 (Denkmal-/Kartendokumentation).
 */
const ROUTE_GUIDE = [
  [49.013674,8.385422], // Gefängnis Riefstahlstraße
  [49.013100,8.385490], // Riefstahlstraße Richtung Süden (annähernd)
  [49.011850,8.385770], // Weiter Richtung Kaiserstraße (annähernd)
  [49.010650,8.386450], // Nähe Mühlburger Tor (annähernd)
  [49.010510,8.388370], // Kaiserstraße westlicher Abschnitt
  [49.010300,8.391900], // Kanzlei Marum
  [49.010040,8.394180], // Europaplatz/Kaiserstraße
  [49.009850,8.396850], // Kaiserstraße auf Höhe Waldstraße (Volksfreund)
  [49.009710,8.398250], // Kaiserstraße weiter nach Osten
  [49.009600,8.399840], // Kaiserstraße / Ritterstraße (annähernd)
  [49.009140,8.400090], // Südliche Richtung Friedrichsplatz
  [49.008757,8.400328]  // Ständehaus
];

/* Dokument-/Gebäudezeichen sind eigene SVG-Piktogramme, keine Archivabbildungen. */
const MARKER_SYMBOLS = [
  '<rect x="7" y="3" width="18" height="25" rx="1.5"/><path d="M13 3v25M19 3v25M7 11h18M7 20h18"/>',
  '<path d="M16 4v23M8 9h16M8 9l-5 10h10L8 9ZM24 9l-5 10h10L24 9ZM9 28h14"/>',
  '<rect x="4" y="4" width="24" height="24" rx="2"/><path d="M9 10h14M9 15h14M9 20h6M19 20h4M9 24h14"/>',
  '<path d="M3 11 16 4l13 7H3ZM7 13v13M13 13v13M19 13v13M25 13v13M4 28h24"/>'
];
function markerHtml(i) {
  return '<span class="memorial-pin" aria-hidden="true">'
       + '<svg class="memorial-symbol" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">'
       + MARKER_SYMBOLS[i] + '</svg>'
       + '<span class="memorial-number">' + String(i+1).padStart(2,"0") + '</span></span>';
}

const STORAGE_KEY = "schaufahrt-webquest-v01";
const DEFAULT_WORK = () => ({question:"",observation:"",analysis:"",message:"",mediaUrl:"",mediaLabel:"",sourceUrl:"",sourceLabel:"",todaySimilarity:"",todayDifference:"",todayConclusion:""});
let work = loadWork();
let activeIndex = 0;
let activeTab = "discover";
let map, markerObjects = [], routeObject;
const byId = id => document.getElementById(id);

/* Gemeinsame, freigegebene Materialien aus derselben Database.
 * Nur LESEN mit öffentlichem Publishable Key, ohne Login.
 * RLS und private Storage-Policies entscheiden serverseitig über Zugriff.
 */
const DB_BUCKET = "webquest-materials";
const DB_KIND = Object.freeze({
  quelle:"Historische Quelle",
  darstellung:"Historische Darstellung",
  bild:"Bild / Fotografie",
  video:"Video / Audio",
  link:"Weiterführender Link",
  gegenwart:"Gegenwartsmaterial"
});
const approvedArchive = {
  client:null, items:[], status:"loading", error:""
};
let materialDialogRequest=0;
let lastArchiveCheck=0;

function safeApprovedUrl(value){
  try{
    const url=new URL(String(value||"").trim());
    return url.protocol==="https:" && !url.username && !url.password && Boolean(url.hostname);
  }catch{return false;}
}
function approvedForStation(stationIndex){
  return approvedArchive.items.filter(item=>item.station===stationIndex+1 && item.kind!=="gegenwart");
}
function approvedTodayForStation(stationIndex){
  return approvedArchive.items.filter(item=>item.station===stationIndex+1 && item.kind==="gegenwart");
}
function todayApprovedSection(stationIndex){
  const area=el("div",{className:"today-shared"});
  area.append(el("strong",{text:"Weitere geprüfte Gegenwartsmaterialien aus der Database"}));
  if(approvedArchive.status==="loading"){
    area.append(el("p",{text:"Gemeinsame Materialien werden geladen …"}));
  } else if(approvedArchive.status==="error" || approvedArchive.status==="unavailable"){
    area.append(el("p",{text:"Die Database ist momentan nicht erreichbar. Die redaktionell ausgewählten Links oben bleiben verfügbar."}));
  } else {
    const matches=approvedTodayForStation(stationIndex);
    if(!matches.length){
      area.append(el("p",{text:"Für diese Station sind noch keine zusätzlichen Gegenwartsmaterialien freigegeben."}));
    } else {
      for(const item of matches){
        const open=el("button",{type:"button",className:"today-shared-item"});
        open.append(el("strong",{text:item.title}),el("small",{text:"Gegenwartsmaterial · geprüft"}));
        open.addEventListener("click",()=>void openApprovedMaterial(item));
        area.append(open);
      }
    }
  }
  area.append(safeAnchor("database.html?station="+String(stationIndex+1),
    "Gegenwartsmaterial zur Database hinzufügen ↗","today-tool-link"));
  return area;
}

async function refreshApprovedArchive(){
  lastArchiveCheck=Date.now();
  const cfg=window.WEBQUEST_DB_CONFIG||{};
  if(!safeApprovedUrl(cfg.url)
    ||typeof cfg.publishableKey!=="string"
    ||!cfg.publishableKey.startsWith("sb_publishable_")
    ||!window.supabase?.createClient){
    approvedArchive.status="unavailable";
    approvedArchive.error="Die Verbindung zur gemeinsamen Database ist derzeit nicht eingerichtet oder konnte nicht geladen werden.";
    if(activeTab==="discover" || activeTab==="today")render();
    return;
  }
  approvedArchive.status="loading";
  if(activeTab==="discover" || activeTab==="today")render();
  try{
    if(!approvedArchive.client){
      approvedArchive.client=window.supabase.createClient(cfg.url,cfg.publishableKey,{
        auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
      });
    }
    const {data,error}=await approvedArchive.client.from("research_materials")
      .select("id,title,kind,station,description,author,historical_date,source_reference,material_url,storage_path")
      .eq("review_status","approved")
      .in("station",[1,2,3,4])
      .order("created_at",{ascending:false})
      .limit(250);
    if(error)throw error;
    approvedArchive.items=(Array.isArray(data)?data:[]).filter(item=>
      Number.isInteger(item.station)&&item.station>=1&&item.station<=4
      &&typeof item.title==="string"
      &&(safeApprovedUrl(item.material_url) || Boolean(item.storage_path))
    );
    approvedArchive.status="ready";
    approvedArchive.error="";
  }catch(error){
    approvedArchive.items=[];
    approvedArchive.status="error";
    approvedArchive.error="Die freigegebenen Materialien sind vorübergehend nicht erreichbar. Die Archivlinks oben bleiben verfügbar.";
    // Details nur in der Entwicklerkonsole, nicht in der Schüleransicht.
    console.warn("Database-Materialien konnten nicht geladen werden:",error);
  }
  if(activeTab==="discover" || activeTab==="today")render();
}

function approvedMaterialSection(stationIndex){
  const wrap=el("div",{className:"approved-archive"});
  const head=el("div",{className:"approved-archive-head"});
  const heading=el("strong",{text:"Freigegebene Materialien aus der Database"});
  const refresh=el("button",{
    type:"button",className:"archive-refresh-small",text:"↻ Aktualisieren",
    title:"Neu freigegebene Materialien laden"
  });
  refresh.addEventListener("click",()=>void refreshApprovedArchive());
  head.append(heading,refresh);
  wrap.append(head);
  const status=el("p",{className:"approved-archive-status"});
  status.setAttribute("role","status");
  if(approvedArchive.status==="loading"){
    status.textContent="Gemeinsame Materialien werden geladen …";
  }else if(approvedArchive.status==="error" || approvedArchive.status==="unavailable"){
    status.textContent=approvedArchive.error;
  }else{
    const count=approvedForStation(stationIndex).length;
    status.textContent=count===0
      ? "Für diese Station sind noch keine Materialien freigegeben."
      : count===1
        ? "1 geprüft und freigegeben · für alle sichtbar"
        : count+" geprüft und freigegeben · für alle sichtbar";
  }
  wrap.append(status);
  if(approvedArchive.status==="ready"){
    const list=el("div",{className:"source-list approved-source-list"});
    for(const item of approvedForStation(stationIndex)){
      const button=el("button",{
        className:"source-card approved-source-card",type:"button",
        title:item.title+" – freigegebenes Material öffnen"
      });
      const icon=item.storage_path
        ? (/\.(?:png|webp|jpg)$/i.test(item.storage_path)?"▧":"▤")
        : "↗";
      const thumbnail=el("div",{className:"source-thumb approved-source-thumb",text:icon});
      button.append(thumbnail);
      button.append(el("strong",{text:item.title}));
      button.append(el("small",{
        text:(DB_KIND[item.kind]||"Material")
          +(item.storage_path?" · Datei ansehen":" · Link öffnen")
      }));
      button.append(el("span",{className:"approved-source-tag",text:"✓ FREIGEGEN"}));
      button.addEventListener("click",()=>void openApprovedMaterial(item));
      list.append(button);
    }
    wrap.append(list);
  }
  const link=safeAnchor("database.html?station="+String(stationIndex+1),
    "Alle Quellen in der Database ansehen ↗","approved-archive-link");
  wrap.append(link);
  return wrap;
}

async function openApprovedMaterial(item){
  materialDialogRequest++;
  const requestId=materialDialogRequest;
  const dialog=byId("source-dialog"), body=byId("dialog-content");
  body.replaceChildren();
  const sourceTitle=el("h3",{text:item.title});
  sourceTitle.setAttribute("data-no-translate","");
  body.append(
    el("p",{className:"section-kicker",text:"DATABASE · FREIGEGEBEN"}),
    sourceTitle,
    el("p",{className:"approved-dialog-kind",text:DB_KIND[item.kind]||"Material"})
  );
  if(item.author)body.append(el("p",{text:"Urheber / Verfasser: "+item.author}));
  if(item.historical_date)body.append(el("p",{text:"Entstehungszeit: "+item.historical_date}));
  body.append(el("p",{text:"Fundstelle: "+(item.source_reference||"Nicht angegeben")}));
  const description=el("p",{text:item.description||"Keine Beschreibung vorhanden."});
  if(item.description)description.setAttribute("data-no-translate","");
  body.append(description);
  if(safeApprovedUrl(item.material_url)){
    body.append(safeAnchor(item.material_url,"Material / externe Fundstelle öffnen ↗"));
    dialog.showModal();
    return;
  }
  if(!item.storage_path||!approvedArchive.client){
    body.append(el("p",{text:"Die Datei kann momentan nicht geladen werden."}));
    dialog.showModal();
    return;
  }
  const preview=el("div",{className:"approved-file-preview"});
  preview.append(el("p",{text:"Geschützte Dateivorschau wird geladen …"}));
  body.append(preview);
  dialog.showModal();
  try{
    const {data,error}=await approvedArchive.client.storage.from(DB_BUCKET)
      .createSignedUrl(item.storage_path,120);
    if(requestId!==materialDialogRequest||!dialog.open)return;
    if(error||!data?.signedUrl)throw error||new Error("Keine Datei-URL erhalten");
    preview.replaceChildren();
    const isImage=/\.(jpg|png|webp)$/i.test(item.storage_path);
    if(isImage){
      const img=el("img");
      img.className="approved-preview-image";
      img.src=data.signedUrl;
      img.alt="Vorschau des Materials: "+item.title;
      img.loading="lazy";
      preview.append(img);
    }else{
      preview.append(el("p",{className:"approved-preview-pdf",text:"▤  PDF-Dokument"}));
    }
    preview.append(safeAnchor(data.signedUrl,
      isImage?"Bild in neuem Tab öffnen ↗":"PDF in neuem Tab öffnen ↗"));
    preview.append(el("p",{
      className:"approved-preview-note",
      text:"Der Dateilink ist aus Datenschutzgründen nur zwei Minuten gültig. Für einen neuen Link das Material erneut öffnen."
    }));
  }catch(error){
    if(requestId!==materialDialogRequest||!dialog.open)return;
    preview.replaceChildren(el("p",{
      className:"approved-preview-error",
      text:"Die Datei kann gerade nicht geöffnet werden. Bitte Verbindung und Freigabe prüfen oder es später erneut versuchen."
    }));
    console.warn("Freigegebene Datei nicht erreichbar:",error);
  }
}

function loadWork() {
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
    return Object.fromEntries(STATIONS.map(s=>[s.id,{...DEFAULT_WORK(),...(saved[s.id]||{})}]));
  } catch {
    return Object.fromEntries(STATIONS.map(s=>[s.id,DEFAULT_WORK()]));
  }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(work)); return true; }
  catch { return false; }
}
function validExternalUrl(value) {
  try { const u=new URL(value); return ["https:","http:"].includes(u.protocol) && Boolean(u.hostname); }
  catch {return false;}
}
function safeAnchor(url,label,cssClass="inline-link"){
  const a=document.createElement("a");
  a.href=url; a.textContent=label; a.className=cssClass; a.target="_blank"; a.rel="noopener noreferrer";
  return a;
}
function el(tag,props={},children=[]) {
  const x=document.createElement(tag);
  for(const [key,val] of Object.entries(props)){
    if(key==="className") x.className=val;
    else if(key==="text") x.textContent=val;
    else if(key==="type"||key==="placeholder"||key==="id"||key==="title") x.setAttribute(key,val);
  }
  for(const child of children) x.append(typeof child==="string"?document.createTextNode(child):child);
  return x;
}
function section(title,symbol,content){
  const block=el("section",{className:"station-section"});
  const heading=el("h4",{},[el("span",{className:"section-symbol",text:symbol}), title]);
  block.append(heading,content);
  return block;
}
function paragraph(text){return el("p",{text});}
function openMaterial(item){
  const d=byId("source-dialog"), body=byId("dialog-content");
  body.replaceChildren();
  body.append(el("p",{className:"section-kicker",text:item.kind||"MATERIAL"}),el("h3",{text:item.label}),paragraph(item.description||""));
  body.append(paragraph("Archivmaterial des vorgegebenen Quellenpakets. Öffnet die Fundstelle, beachtet Urheber und Entstehungszeit und prüft die Perspektive der Quelle."));
  if(validExternalUrl(item.url)) body.append(safeAnchor(item.url,"Quelle / Fundstelle in neuem Tab öffnen ↗"));
  d.showModal();
}
function discoverView(station){
  const body=el("div");
  body.append(section("Wo sind wir?","⌖",paragraph(station.where)));
  body.append(section("Was ist hier passiert?","◷",paragraph(station.happened)));
  const sourceWrap=el("div");
  sourceWrap.append(paragraph("Die Ausgangsmaterialien dienen eurer ersten Orientierung. Prüft ihre Herkunft, Perspektive und Aussagekraft. Weitere freigegebene Forschungsfunde aus der gemeinsamen Database erscheinen darunter."));
  const list=el("div",{className:"source-list"});
  const current=work[station.id];
  const sources=[...station.sources];
  if(validExternalUrl(current.sourceUrl)) sources.push({label:current.sourceLabel||"Ergänzte Quelle",kind:"Euer Material",description:"Von dieser Arbeitsgruppe ergänzter Quellenlink; noch nicht durch eine Lehrkraft überprüft.",url:current.sourceUrl});
  sources.forEach((source,index)=>{
    const card=el("button",{className:"source-card",type:"button"});
    const thumb=el("div",{className:"source-thumb",text:index%2===0?"▤":"▧"});
    card.append(thumb,el("strong",{text:source.label}),el("small",{text:source.kind+" · öffnen"}));
    card.addEventListener("click",()=>openMaterial(source));
    list.append(card);
  });
  sourceWrap.append(list,approvedMaterialSection(STATIONS.indexOf(station)));
  body.append(section("Welche Materialien gibt es?", "▤",sourceWrap));
  const q=el("div",{className:"question-card"});
  q.append(el("strong",{text:"MÖGLICHE FORSCHUNGSFRAGE"}),paragraph(station.question));
  const ul=el("ul");station.prompts.forEach(p=>ul.append(el("li",{text:p})));q.append(ul);
  body.append(section("Was sollt ihr untersuchen?", "?",q));
  const results=el("div");
  if(current.analysis.trim()){
    results.append(el("p",{text:current.analysis}));
  }else{
    results.append(el("div",{className:"empty-box",text:"Noch offen: Eure historische Erklärung und die Quellenbelege."}));
  }
  if(validExternalUrl(current.mediaUrl)){
    results.append(safeAnchor(current.mediaUrl,(current.mediaLabel||"Unser Medienbeitrag")+" ↗"));
  }else{
    results.append(el("div",{className:"empty-box",text:"Noch kein Video, keine Bildergalerie oder Präsentation eingefügt."}));
  }
  body.append(section("Euer digitaler Beitrag", "▣",results));
  return body;
}

/* Gegenwartsmaterialien sind redaktionell ausgewählte externe Darstellungen,
 * keine unmittelbaren Augenzeugenquellen zu 1933 und kein Echtzeit-Newsfeed.
 * Fälle und Rechtslage jeweils vor dem Unterricht erneut auf Aktualität prüfen.
 */
const TODAY_CASES = [
  {
    label:"FALL A · POLITISCHE GEWALT",
    title:"Angriff auf Matthias Ecke (2024)",
    background:"Am 3. Mai 2024 wurde der SPD-Politiker Matthias Ecke beim Aufhängen von Wahlplakaten in Dresden angegriffen und schwer verletzt. Der Angriff war eine Gewalttat gegen einen politisch engagierten Menschen.",
    focus:"1933 organisierten die nationalsozialistischen Machthaber die öffentliche Demütigung und Verschleppung politischer Gegner. Heute ist eine solche Gewalttat verboten. Polizei und Justiz müssen dagegen vorgehen.",
    question:"Wer übte 1933 Gewalt aus? Wer übte sie 2024 aus – und welche Rolle spielt der demokratische Rechtsstaat?",
    materials:[
      {label:"bpb · Angriff auf Matthias Ecke (2024)",url:"https://www.bpb.de/kurz-knapp/taegliche-dosis-politik/548158/angriff-auf-spd-politiker-matthias-ecke/",note:"Kurzbericht als Gegenwartsdarstellung; Erscheinungsdatum und Perspektive beachten"}
    ]
  },
  {
    label:"FALL A · PERSÖNLICHE EINSCHÜCHTERUNG",
    title:"Wenn politische Gegner angegriffen werden",
    background:"Der Angriff auf Matthias Ecke im Wahlkampf 2024 zeigt, dass Menschen wegen ihres politischen Engagements eingeschüchtert und körperlich angegriffen werden können.",
    focus:"Ludwig Marum war 1933 selbst Gefangener und wurde gezielt an seiner eigenen Kanzlei vorgeführt. Ein heutiger Gewalttäter handelt dagegen nicht im Namen des demokratischen Rechtsstaats.",
    question:"Was soll eine öffentliche Demütigung oder Bedrohung bewirken? Welche Schutzmöglichkeiten gibt es heute?",
    materials:[
      {label:"bpb · Angriff auf Matthias Ecke (2024)",url:"https://www.bpb.de/kurz-knapp/taegliche-dosis-politik/548158/angriff-auf-spd-politiker-matthias-ecke/",note:"Fragen zu politischer Einschüchterung und Schutz vor Gewalt"},
      {label:"Grundgesetz · Grundrechte und Rechtsstaat",url:"https://www.bundestag.de/parlament/aufgaben/rechtsgrundlagen/grundgesetz",note:"Rechtlicher Maßstab für den Gegenwartsvergleich"}
    ]
  },
  {
    label:"FALL C · MEDIEN UND DEBATTEN",
    title:"Politische Kritik oder persönliche Herabsetzung?",
    background:"Politische Parteien dürfen sich in einer Demokratie widersprechen und scharf kritisieren. Fernsehdiskussionen, Zeitungen und soziale Medien prägen, wie wir politische Gegner wahrnehmen.",
    focus:"Die Zeitung Volksfreund wurde 1933 verboten. Heute schützt Artikel 5 des Grundgesetzes grundsätzlich die Meinungs- und Pressefreiheit. Sachliche Kritik und persönliche Angriffe sind bei der Analyse zu unterscheiden.",
    question:"Wann kritisieren Medien eine politische Position? Wann werden Menschen persönlich herabgesetzt oder als Feinde dargestellt?",
    materials:[
      {label:"bpb · Mitreden können: Politisch diskutieren",url:"https://www.bpb.de/shop/zeitschriften/apuz/148218/mitreden-koennen-die-bedeutung-der-politischen-beredsamkeit-in-der-demokratie/",note:"Material zur politischen Streitkultur; ordnet persönliche Angriffe ein"},
      {label:"Grundgesetz · Artikel 5",url:"https://www.bundestag.de/parlament/aufgaben/rechtsgrundlagen/grundgesetz",note:"Meinungs- und Pressefreiheit: Den vollständigen Gesetzestext prüfen"}
    ]
  },
  {
    label:"FALL B · DEMONSTRATIONEN",
    title:"Protest für Demokratie und gegen Gewalt (2024)",
    background:"Nach dem Angriff auf Matthias Ecke demonstrierten Menschen im Mai 2024 in Dresden und Berlin gegen politische Gewalt und für die Demokratie.",
    focus:"1933 diente die staatlich organisierte Schaufahrt der Einschüchterung. Eine heutige friedliche Demonstration kann dagegen Ausdruck des Grundrechts auf Versammlungsfreiheit sein.",
    question:"Was unterscheidet die erzwungene Schaufahrt 1933 von einer freiwilligen friedlichen Demonstration heute?",
    materials:[
      {label:"Deutschlandfunk · Demonstrationen nach dem Angriff (05.05.2024)",url:"https://www.deutschlandfunk.de/demonstrationen-fuer-demokratie-und-gegen-gewalt-nach-angriff-gegen-spd-europaabgeordneten-102.html",note:"Nachrichtenbericht über die Proteste 2024"},
      {label:"Deutscher Bundestag · Artikel 8 Grundgesetz",url:"https://www.bundestag.de/parlament/grundgesetz/641190-641190",note:"Grundrecht auf friedliche Versammlungen"}
    ]
  }
];

function todayView(station){
  const index=STATIONS.indexOf(station),item=TODAY_CASES[index];
  const body=el("div",{className:"today-workspace"});
  body.append(el("p",{className:"section-kicker",text:"1933 UND HEUTE"}));
  body.append(el("h4",{className:"today-title",text:"Politische Gegner – damals und heute"}));
  body.append(el("p",{
    className:"today-intro",
    text:"Untersucht einen Fall von heute. Nennt eine Gemeinsamkeit und einen grundlegenden Unterschied. Die Verfolgung in einer NS-Diktatur ist nicht mit einem heutigen Rechtsstaat gleichzusetzen."
  }));
  const c=el("div",{className:"today-case"});
  c.append(el("span",{className:"today-case-label",text:item.label}));
  c.append(el("h5",{text:item.title}),el("p",{text:item.background}));
  c.append(el("p",{className:"today-focus",text:item.focus}));
  body.append(c);

  const materialList=el("div",{className:"today-materials"});
  for(const material of item.materials){
    const row=el("div",{className:"today-material"});
    row.append(safeAnchor(material.url,material.label+" ↗","today-material-link"));
    row.append(el("small",{text:material.note}));
    materialList.append(row);
  }
  body.append(section("Gegenwartsmaterialien prüfen","▤",materialList));
  body.append(todayApprovedSection(index));

  const task=el("div",{className:"today-question-card"});
  task.append(el("strong",{text:"EURE VERGLEICHSFRAGE"}),el("p",{text:item.question}));
  task.append(el("p",{className:"today-task",text:"Lest die Gegenwartsquelle. Vergleicht mit euren historischen Quellen. Belegt eure Aussagen und achtet darauf, wer handelt und welche Rechte gelten."}));
  task.append(safeAnchor("methodenkoffer.html#demokratie-kompass","Zum Demokratie-Kompass ↗","today-tool-link"));
  body.append(section("Vergleicht kritisch","?",task));

  const fields=[
    ["todaySimilarity","Eine Gemeinsamkeit","In beiden Fällen …"],
    ["todayDifference","Ein grundlegender Unterschied","Anders als 1933 …"],
    ["todayConclusion","Unsere Schlussfolgerung für die Demokratie","Für eine Demokratie bedeutet das …"]
  ];
  const form=el("div",{className:"today-comparison"});
  form.append(el("p",{text:"Haltet eure Antworten gemeinsam fest. Sie werden wie die übrigen Kartennotizen nur in diesem Browser gespeichert."}));
  for(const [key,label,placeholder] of fields){
    const labelElement=el("label",{text:label});
    const id="today-"+key;
    labelElement.setAttribute("for",id);
    const field=el("textarea",{id,placeholder});
    field.rows=3;
    field.value=work[station.id][key]||"";
    field.addEventListener("input",()=>{
      work[station.id][key]=field.value;
      const saved=persist();
      const status=form.querySelector(".today-save-note");
      if(status) status.textContent=saved?"✓ Lokal im Browser gespeichert":"Achtung: Browser-Speicherung ist nicht verfügbar. Bitte Daten exportieren.";
      updateCounters();
    });
    form.append(labelElement,field);
  }
  const status=el("p",{className:"today-save-note",text:"Änderungen werden automatisch lokal gespeichert."});
  form.append(status);
  const hint=el("p",{className:"today-didactic-hint",text:"Wichtig: Staatlich organisierte Verfolgung in der NS-Diktatur ist nicht dasselbe wie politische Konflikte oder einzelne Straftaten in einem demokratischen Rechtsstaat."});
  body.append(section("Euer Gegenwartsvergleich","◈",form),hint);
  const controls=el("div",{className:"today-actions"});
  const exportBtn=el("button",{type:"button",className:"primary-action",text:"Arbeitsstand exportieren"});
  exportBtn.addEventListener("click",exportWork);
  const editBtn=el("button",{type:"button",text:"Historische Notizen bearbeiten"});
  editBtn.addEventListener("click",()=>{activeTab="edit";render()});
  controls.append(exportBtn,editBtn);
  body.append(controls);
  return body;
}

function saveStatus(stationId){
  const d=work[stationId];return Boolean(d.analysis.trim()||d.observation.trim()||validExternalUrl(d.mediaUrl));
}
function updateCounters(){
  const done=STATIONS.filter(s=>saveStatus(s.id)).length;byId("completed-count").textContent=String(done);
  const completed=saveStatus(STATIONS[activeIndex].id),badge=byId("station-status");
  badge.textContent=completed?"LOKAL BEARBEITET":"NOCH NICHT BEARBEITET";
  badge.className="chip "+(completed?"chip-done":"chip-pending");
  byId("station-buttons").querySelectorAll(".station-btn").forEach((btn,i)=>{
    const small=btn.querySelector("small");small.textContent=saveStatus(STATIONS[i].id)?"Lokale Notizen":"Noch offen";
  });
}
function editView(station){
  const data=work[station.id], container=el("div",{className:"editor"});
  container.append(el("div",{className:"edit-helper",text:"Eure Einträge werden nur auf diesem Gerät und in diesem Browser gespeichert. Sie sind NICHT automatisch für Mitschüler oder Lehrkräfte sichtbar. Exportiert eure Daten, bevor ihr das Gerät wechselt."}));
  const fields=[
    ["question","Unsere Unterleitfrage","Welche historische Frage untersucht ihr?"],
    ["observation","Unsere Quellenbeobachtungen und Fundstellen","Was zeigt Quelle A? Welche Stelle belegt eure Beobachtung?"],
    ["analysis","Unsere historische Erklärung","Welche Aussage ist durch die Quellen begründet?"],
    ["message","Unsere Erinnerungsbotschaft","Was sollten Besucherinnen und Besucher verstehen?"],
    ["mediaLabel","Name des Medienbeitrags","z. B. Bildergalerie zur Kanzlei Marum"],
    ["mediaUrl","Link zum Medienbeitrag (https://…)","https://…"],
    ["sourceLabel","Titel einer ergänzten Quelle","Quellentitel und gegebenenfalls Archivsignatur"],
    ["sourceUrl","Link zur ergänzten Quelle (https://…)","https://…"]
  ];
  fields.forEach(([key,label,placeholder])=>{
    const id="field-"+key;
    const labelElement=el("label",{text:label});
    labelElement.setAttribute("for",id);
    const field=key==="analysis"||key==="observation"||key==="question"||key==="message"?el("textarea",{id,placeholder}):el("input",{id,placeholder,type:"text"});
    field.value=data[key]||"";
    field.addEventListener("input",()=>{
      work[station.id][key]=field.value;
      const saved=persist();
      byId("save-message").textContent=saved?"✓ Lokal im Browser gespeichert":"Achtung: Browser-Speicherung ist nicht verfügbar. Bitte Daten exportieren.";
      updateCounters();
    });
    container.append(labelElement,field);
    if(key==="mediaUrl")container.append(el("small",{text:"Nur Links einfügen, die für die Zielgruppe freigegeben sind. Bitte keine persönlichen Schülerdaten veröffentlichen."}));
    if(key==="sourceUrl")container.append(el("small",{text:"Ergänzte Materialien sind zunächst ungeprüft und müssen fachlich sowie urheberrechtlich geprüft werden."}));
  });
  const actions=el("div",{className:"editor-actions"});
  const exportBtn=el("button",{type:"button",className:"primary-action",text:"Arbeitsstand exportieren"});
  exportBtn.addEventListener("click",exportWork);
  const copyBtn=el("button",{type:"button",text:"Text kopieren"});
  copyBtn.addEventListener("click",()=>{
    const text=fields.map(([key,label])=>label+":\n"+(work[station.id][key]||"—")).join("\n\n");
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>{byId("save-message").textContent="Text kopiert."}).catch(()=>{byId("save-message").textContent="Kopieren nicht möglich. Nutzt den Export."});
  });
  const clearBtn=el("button",{type:"button",text:"Station zurücksetzen"});
  clearBtn.addEventListener("click",()=>{
    if(!window.confirm("Alle lokalen Einträge dieser Station löschen?"))return;
    work[station.id]=DEFAULT_WORK();persist();render();
  });
  actions.append(exportBtn,copyBtn,clearBtn);
  container.append(actions,el("p",{id:"save-message",className:"save-note",text:"Änderungen werden automatisch lokal gespeichert."}));
  return container;
}
function exportWork(){
  const payload={project:"Karlsruhe 1933 WebQuest",exportedAt:new Date().toISOString(),note:"Lokaler Arbeitsstand, nicht veröffentlicht oder fachlich geprüft.",stations:work};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="karlsruhe-1933-gruppenstand.json";a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function choose(index){
  activeIndex=index;
  render();
  if(map&&markerObjects[index]){map.flyTo(STATIONS[index].coordinates,15,{duration:.4});}
}
function render(){
  const station=STATIONS[activeIndex];
  byId("station-index").textContent="STATION "+String(activeIndex+1).padStart(2,"0")+" / 04";
  byId("station-title").textContent=station.name;
  byId("station-address").textContent="⌖ "+station.address+" · Kartenposition näherungsweise";
  byId("station-body").replaceChildren(activeTab==="discover"?discoverView(station):activeTab==="today"?todayView(station):editView(station));
  byId("tab-discover").classList.toggle("active",activeTab==="discover");
  byId("tab-edit").classList.toggle("active",activeTab==="edit");
  byId("tab-today").classList.toggle("active",activeTab==="today");
  byId("tab-discover").setAttribute("aria-selected",activeTab==="discover"?"true":"false");
  byId("tab-edit").setAttribute("aria-selected",activeTab==="edit"?"true":"false");
  byId("tab-today").setAttribute("aria-selected",activeTab==="today"?"true":"false");
  byId("station-buttons").querySelectorAll(".station-btn").forEach((b,i)=>b.classList.toggle("active",i===activeIndex));
  markerObjects.forEach((m,i)=>{
    const icon=m.getElement();
    if(icon)icon.classList.toggle("is-active",i===activeIndex);
  });
  updateCounters();
}
function setupMap(){
  const mapHolder=byId("map");
  if(!window.L){
    mapHolder.replaceChildren(el("p",{className:"map-fallback",text:"Die Kartenbibliothek konnte nicht geladen werden. Die Stationen sind über die Schaltflächen unter der Karte trotzdem erreichbar."}));
    return;
  }
  mapHolder.replaceChildren();
  map=L.map("map",{scrollWheelZoom:false,zoomControl:true,preferCanvas:true}).setView([49.011,8.392],14);

  /*
   * Bewährte OSM-Kacheln: über CSS farblich reduziert.
   * So entsteht ein weiß-beigefarbener Kartenstil ohne externes Tile-API-Konto.
   * Die OpenStreetMap-Attribution bleibt dauerhaft sichtbar.
   */
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
  }).addTo(map);

  routeObject=L.polyline(ROUTE_GUIDE,{
    color:"#A72C36",weight:4.5,opacity:.88,dashArray:"10,7",
    lineCap:"round",lineJoin:"round",interactive:false
  }).addTo(map);

  // Die Symbol-Marker bleiben getrennt von der Fahrtlinie; manche Gebäude
  // liegen neben dem Straßenraum, den der historische Wagen passierte.
  STATIONS.forEach((station,i)=>{
    const marker=L.marker(station.coordinates,{
      keyboard:true,
      title:station.name,
      alt:"Station "+(i+1)+": "+station.name,
      icon:L.divIcon({
        className:"station-marker-v2",
        html:markerHtml(i),
        iconSize:[50,65],
        iconAnchor:[25,62],
        tooltipAnchor:[0,-52]
      })
    }).addTo(map).bindTooltip(station.short,{direction:"top",offset:[0,-14]});
    marker.on("click",()=>choose(i));
    markerObjects.push(marker);
  });
  const fit=L.latLngBounds([...ROUTE_GUIDE,...STATIONS.map(s=>s.coordinates)]);
  map.fitBounds(fit.pad(.14),{maxZoom:15,padding:[28,28]});
}
function setup(){
  const buttons=byId("station-buttons");
  STATIONS.forEach((s,i)=>{
    const b=el("button",{type:"button",className:"station-btn"});
    b.append(el("span",{className:"station-number",text:String(i+1).padStart(2,"0")}),el("span",{},[el("strong",{text:s.short}),el("small",{text:"Noch offen"})]));
    b.addEventListener("click",()=>choose(i));buttons.append(b);
  });
  byId("tab-discover").addEventListener("click",()=>{activeTab="discover";render()});
  byId("tab-edit").addEventListener("click",()=>{activeTab="edit";render()});
  byId("tab-today").addEventListener("click",()=>{activeTab="today";render()});
  byId("fit-map").addEventListener("click",()=>{if(map&&routeObject){const fit=L.latLngBounds([...ROUTE_GUIDE,...STATIONS.map(s=>s.coordinates)]);map.fitBounds(fit.pad(.14),{maxZoom:15,padding:[28,28]});}});
  byId("close-dialog").addEventListener("click",()=>{materialDialogRequest++;byId("source-dialog").close()});
  byId("source-dialog").addEventListener("click",e=>{if(e.target===byId("source-dialog"))byId("source-dialog").close()});
  setupMap();render();
  void refreshApprovedArchive();
  document.addEventListener("visibilitychange",()=>{
    // Beim Zurückkehren vom Freigabe-Dashboard neue Einträge anzeigen.
    if(!document.hidden && Date.now()-lastArchiveCheck>20000){
      void refreshApprovedArchive();
    }
  });
}
document.addEventListener("DOMContentLoaded",setup);
