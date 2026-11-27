"use strict";

/*
 * Karlsruher WebQuest · Prototyp 0.1
 * Die Koordinaten und die Verbindungslinie sind ORIENTIERUNGSWERTE.
 * Die eigentliche Schaufahrt-Route anhand des Stadtarchivs rekonstruieren.
 * Alle Einträge liegen vorerst ausschließlich im Browser (localStorage).
 */
const ARCHIVE_ROOT = "https://stadtgeschichte.karlsruhe.de/erinnerungskultur/erinnerungskultur-im-oeffentlichen-raum/schaufahrt-1933";
const STATIONS = [
  {
    id:"gefängnis", name:"Gefängnis Riefstahlstraße", short:"Gefängnis", address:"Riefstahlstraße 9, Karlsruhe", coordinates:[49.0129,8.3983],
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
    id:"marum", name:"Kanzlei Ludwig Marum", short:"Kanzlei Marum", address:"Kaiserstraße 176, Karlsruhe", coordinates:[49.0105,8.3986],
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
    id:"volksfreund", name:"Redaktion des Volksfreund", short:"Volksfreund", address:"Waldstraße 28, Karlsruhe", coordinates:[49.0095,8.3962],
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
    id:"ständehaus", name:"Badisches Ständehaus", short:"Ständehaus", address:"Friedrichsplatz, Karlsruhe", coordinates:[49.0084,8.4013],
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

const STORAGE_KEY = "schaufahrt-webquest-v01";
const DEFAULT_WORK = () => ({question:"",observation:"",analysis:"",message:"",mediaUrl:"",mediaLabel:"",sourceUrl:"",sourceLabel:""});
let work = loadWork();
let activeIndex = 0;
let activeTab = "discover";
let map, markerObjects = [], routeObject;
const byId = id => document.getElementById(id);
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
  body.append(paragraph("Hinweis: Dieser Prototyp enthält noch keine lokal hochgeladenen Archivscans. Die Fundstelle lässt sich über den folgenden Link öffnen."));
  if(validExternalUrl(item.url)) body.append(safeAnchor(item.url,"Quelle / Fundstelle in neuem Tab öffnen ↗"));
  d.showModal();
}
function discoverView(station){
  const body=el("div");
  body.append(section("Wo sind wir?","⌖",paragraph(station.where)));
  body.append(section("Was ist hier passiert?","◷",paragraph(station.happened)));
  const sourceWrap=el("div");
  sourceWrap.append(paragraph("Erste Materialien: Sie sind noch nicht quellenkritisch ausgewertet. Für die spätere Fassung werden Originalscans und genaue Fundstellen ergänzt."));
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
  sourceWrap.append(list,el("div",{className:"empty-box",text:"+ Weitere Originalquellen fehlen noch – ergänzt und prüft sie während eurer Forschung."}));
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
  byId("station-body").replaceChildren(activeTab==="discover"?discoverView(station):editView(station));
  byId("tab-discover").classList.toggle("active",activeTab==="discover");
  byId("tab-edit").classList.toggle("active",activeTab==="edit");
  byId("tab-discover").setAttribute("aria-selected",activeTab==="discover"?"true":"false");
  byId("tab-edit").setAttribute("aria-selected",activeTab==="edit"?"true":"false");
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
  map=L.map("map",{scrollWheelZoom:false,zoomControl:true}).setView([49.0098,8.3983],14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
  }).addTo(map);
  routeObject=L.polyline(STATIONS.map(s=>s.coordinates),{color:"#994a3d",weight:4,opacity:.85,dashArray:"9,8"}).addTo(map);
  STATIONS.forEach((station,i)=>{
    const marker=L.marker(station.coordinates,{
      icon:L.divIcon({className:"station-marker",html:String(i+1).padStart(2,"0"),iconSize:[34,34],iconAnchor:[17,17]})
    }).addTo(map).bindTooltip(station.short,{direction:"top",offset:[0,-15]});
    marker.on("click",()=>choose(i));
    markerObjects.push(marker);
  });
  map.fitBounds(routeObject.getBounds().pad(.28),{maxZoom:15});
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
  byId("fit-map").addEventListener("click",()=>{if(map&&routeObject)map.fitBounds(routeObject.getBounds().pad(.28),{maxZoom:15})});
  byId("close-dialog").addEventListener("click",()=>byId("source-dialog").close());
  byId("source-dialog").addEventListener("click",e=>{if(e.target===byId("source-dialog"))byId("source-dialog").close()});
  setupMap();render();
}
document.addEventListener("DOMContentLoaded",setup);
