"use strict";
/*
 * Karlsruher WebQuest · handgepflegte Sprachen (DE / EN / Einfache Sprache)
 * Keine automatische Online-Übersetzung und keine Übertragung von Texten.
 * Die vereinfachte Fassung ist redaktionelle Einfache Sprache,
 * ausdrücklich keine geprüfte "Leichte Sprache".
 */
(() => {
  const LANGUAGE_KEY="karlsruhe-webquest-language-v1";
  const LANGUAGE_LIST=["de","en","easy"];
  const localeIndex={en:1,easy:2};
  const dictionaries=new Map();
  for(const entry of (window.WQ_TRANSLATIONS||[])){
    if(Array.isArray(entry)&&entry.length===3&&typeof entry[0]==="string"){
      dictionaries.set(entry[0].replace(/\s+/g," ").trim(),entry);
    }
  }
  const originalText=new WeakMap();
  const appliedText=new WeakMap();
  const originalAttribute=new WeakMap();
  const appliedAttribute=new WeakMap();
  const protectedSelectors=[
    "script","style","textarea","[contenteditable]","[data-no-translate]",
    "[translate='no']","#language-picker",
    ".archive-item-title",".archive-item-description",".archive-item-info",
    ".archive-detail-fields dd",".approved-source-card strong",
    ".archive-detail-body h2",".archive-file-preview img"
  ].join(",");
  const pageTitles={
    "index.html":["Gegner oder Feind? | Karlsruhe erinnert","Opponent or Enemy? | Karlsruhe Remembers","Gegner oder Feind? | Karlsruhe erinnert"],
    "auftrag.html":["Der Auftrag | Karlsruhe erinnert","The Assignment | Karlsruhe Remembers","Der Auftrag | Karlsruhe erinnert"],
    "karte.html":["Historische Karte | Karlsruhe erinnert","Historical Map | Karlsruhe Remembers","Karte | Karlsruhe erinnert"],
    "database.html":["Database | Karlsruhe erinnert","Database | Karlsruhe Remembers","Material-Sammlung | Karlsruhe erinnert"],
    "methodenkoffer.html":["Methodenkoffer | Karlsruhe erinnert","Research Toolkit | Karlsruhe Remembers","Hilfe | Karlsruhe erinnert"],
    "erinnerungsrundgang.html":["Erinnerungsrundgang | Karlsruhe erinnert","Remembrance Tour | Karlsruhe Remembers","Erinnerungs-Rundgang | Karlsruhe erinnert"]
  };
  let language="de",picker=null,scheduled=false,observer=null;

  function normalize(value){return value.replace(/\s+/g," ").trim();}
  function tr(value, lang=language){
    if(lang==="de")return value;
    const match=dictionaries.get(normalize(String(value)));
    if(match) return match[localeIndex[lang]]||value;
    // Historical source category + action; the descriptor remains
    // separate for accessibility even if it is rendered as one text node.
    const action=value.match(/^(.*?) · (öffnen|Link öffnen|Datei ansehen)$/);
    if(action){
      const suffix={
        "öffnen":lang==="en"?"open":"öffnen",
        "Link öffnen":lang==="en"?"open link":"Link öffnen",
        "Datei ansehen":lang==="en"?"view file":"Datei ansehen"
      }[action[2]];
      return tr(action[1],lang)+" · "+suffix;
    }
    const prefixPairs=[
      ["Vorschau des Materials: ","Preview of Material: ","Vorschau des Materials: "],
      ["Fundstelle: ","Source Reference: ","Fundstelle: "],
      ["Urheber / Verfasser: ","Creator / Author: ","Wer hat es gemacht? "],
      ["Entstehungszeit: ","Date Created: ","Wann entstand es? "],
      ["Speichern fehlgeschlagen: ","Save Failed: ","Speichern ging nicht: "],
      ["Anmeldung fehlgeschlagen. Prüfe E-Mail, Passwort und Projektfreigabe. ","Sign-In Failed. Check Email, Password, and Project Access. ","Die Anmeldung hat nicht funktioniert. Prüft eure Zugangsdaten. "],
      ["Datei-Upload fehlgeschlagen: ","File Upload Failed: ","Die Datei konnte nicht hochgeladen werden: "]
    ];
    for(const [source,english,simple] of prefixPairs){
      if(value.startsWith(source)){
        return (lang==="en"?english:simple)+value.slice(source.length);
      }
    }
    // Gruppenbelegung: den frei gewählten Gruppennamen nicht übersetzen.
    const count=value.match(/^(\d+) von 4 belegt$/);
    if(count){
      return lang==="en" ? count[1]+" of 4 assigned" : count[1]+" von 4 Orten vergeben";
    }
    const mine=value.match(/^Diese Station gehört eurer Gruppe: (.+)\.$/);
    if(mine){
      return lang==="en"
        ? "Your group has claimed this site: "+mine[1]+"."
        : "Dieser Ort gehört eurer Gruppe: "+mine[1]+".";
    }
    const occupied=value.match(/^Bereits vergeben an (.+)\. Bitte wählt einen anderen Ort\.$/);
    if(occupied){
      return lang==="en"
        ? "Already assigned to "+occupied[1]+". Please choose another site."
        : "Dieser Ort gehört schon "+occupied[1]+". Wählt einen anderen.";
    }
    const another=value.match(/^Noch frei\. Euer Konto hat aber bereits Station (\d+) – (.+) übernommen\.$/);
    if(another){
      return lang==="en"
        ? "Available, but your group account already has site "+another[1]+" – "+tr(another[2],lang)+"."
        : "Dieser Ort ist frei. Eure Gruppe hat aber schon Ort "+another[1]+" – "+tr(another[2],lang)+".";
    }
    // Dynamische Zähler, Datums-/Stationsnummern und verknüpfte Ortsangaben.
    if(lang==="en"){
      if(/^(\d+) Materialien$/.test(value))return value.replace(" Materialien"," materials");
      if(value==="1 Material")return "1 material";
      if(/^(\d+) geprüft und freigegeben · für alle sichtbar$/.test(value))return value.replace(" geprüft und freigegeben · für alle sichtbar"," approved · visible to everyone");
      if(value.startsWith("STATION ")&&value.endsWith(" / 04"))return value;
      if(value.startsWith("⌖ ")&&value.includes(" · Kartenposition näherungsweise"))return value.replace(" · Kartenposition näherungsweise"," · approximate map position");
    } else if(lang==="easy"){
      if(/^(\d+) Materialien$/.test(value))return value;
      if(/^(\d+) geprüft und freigegeben · für alle sichtbar$/.test(value))return value.replace(" geprüft und freigegeben · für alle sichtbar"," Quellen geprüft · alle können sie sehen");
      if(value.startsWith("STATION ")&&value.endsWith(" / 04"))return value.replace("STATION","ORT");
      if(value.startsWith("⌖ ")&&value.includes(" · Kartenposition näherungsweise"))return value.replace(" · Kartenposition näherungsweise"," · Ort ungefähr eingezeichnet");
    }
    return value;
  }

  function isProtected(node){
    const parent=node.nodeType===Node.ELEMENT_NODE?node:node.parentElement;
    return !parent||Boolean(parent.closest(protectedSelectors));
  }
  function translateText(node){
    if(node.nodeType!==Node.TEXT_NODE||isProtected(node))return;
    const value=node.nodeValue||"";
    if(!value.trim())return;
    const last=appliedText.get(node);
    if(!originalText.has(node)||last!==undefined&&value!==last)originalText.set(node,value);
    const original=originalText.get(node);
    const core=normalize(original);
    const translated=tr(core);
    // Exact match by normalized text, preserving the node's surrounding spacing.
    const expected=core===translated?original:original.replace(/(\S[\s\S]*\S|\S)/,
      function(){return translated;});
    if(expected!==value)node.nodeValue=expected;
    appliedText.set(node,expected);
  }
  function translateAttributes(element){
    if(isProtected(element))return;
    for(const name of ["placeholder","title","alt","aria-label"]){
      if(!element.hasAttribute(name))continue;
      let originals=originalAttribute.get(element);
      let applied=appliedAttribute.get(element);
      if(!originals){originals={};originalAttribute.set(element,originals);}
      if(!applied){applied={};appliedAttribute.set(element,applied);}
      const value=element.getAttribute(name);
      if(!(name in originals)||(name in applied&&value!==applied[name])){
        originals[name]=value;
      }
      const next=tr(originals[name]);
      if(value!==next)element.setAttribute(name,next);
      applied[name]=next;
    }
  }
  function translateTree(root){
    if(root.nodeType===Node.ELEMENT_NODE&&!isProtected(root))translateAttributes(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        if(isProtected(node))return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while((node=walker.nextNode())){
      if(node.nodeType===Node.TEXT_NODE)translateText(node);
      else if(node.nodeType===Node.ELEMENT_NODE)translateAttributes(node);
    }
  }
  function applyLanguage(){
    if(!document.body)return;
    document.documentElement.lang=language==="en"?"en":"de";
    document.documentElement.classList.toggle("simple-language",language==="easy");
    const page=location.pathname.split("/").pop()||"index.html";
    if(pageTitles[page])document.title=pageTitles[page][language==="de"?0:localeIndex[language]];
    translateTree(document.body);
    const native=picker?.querySelector("select");
    if(native)native.value=language;
  }
  function updateLanguage(lang){
    if(!LANGUAGE_LIST.includes(lang))return;
    language=lang;
    try{localStorage.setItem(LANGUAGE_KEY,lang);}catch{}
    applyLanguage();
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;applyLanguage();});
  }

  function createPicker(){
    const header=document.querySelector(".topbar");
    if(!header)return;
    const wrap=document.createElement("div");
    wrap.id="language-picker";
    wrap.className="language-picker";
    wrap.setAttribute("translate","no");
    const label=document.createElement("label");
    label.setAttribute("for","webquest-language");
    label.className="language-picker-label";
    label.textContent="Sprache wählen / Select language";
    const globe=document.createElement("span");
    globe.className="language-picker-icon";
    globe.setAttribute("aria-hidden","true");
    globe.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 2.4 4.5 5.4 4.5 9s-1.5 6.6-4.5 9M12 3C9 5.4 7.5 8.4 7.5 12s1.5 6.6 4.5 9"/></svg>';
    const select=document.createElement("select");
    select.id="webquest-language";
    select.className="language-picker-select";
    select.setAttribute("aria-label","Sprache wählen / Select language");
    select.title="Deutsch, English, Einfache Sprache (keine geprüfte Leichte Sprache)";
    const opts=[
      ["de","DE · Deutsch"],["en","EN · English"],["easy","Einfach · DE"]
    ];
    for(const [value,name] of opts){
      const option=document.createElement("option");
      option.value=value;option.textContent=name;select.append(option);
    }
    select.addEventListener("change",()=>updateLanguage(select.value));
    const labelNote=document.createElement("span");
    labelNote.className="language-picker-caret";
    labelNote.setAttribute("aria-hidden","true");
    labelNote.textContent="⌄";
    wrap.append(label,globe,select,labelNote);
    const topLabel=header.querySelector(".top-label");
    if(topLabel)header.insertBefore(wrap,topLabel);else header.append(wrap);
    picker=wrap;
  }
  function init(){
    try{
      const stored=localStorage.getItem(LANGUAGE_KEY);
      if(LANGUAGE_LIST.includes(stored))language=stored;
    }catch{}
    createPicker();
    applyLanguage();
    observer=new MutationObserver(schedule);
    observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["placeholder","title","alt","aria-label"]});
    window.addEventListener("storage",event=>{
      if(event.key===LANGUAGE_KEY&&LANGUAGE_LIST.includes(event.newValue)){
        language=event.newValue;applyLanguage();
      }
    });
  }
  // The other page scripts may create station cards and dialog contents first.
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
  window.WQ_LANGUAGE={
    get:()=>language,
    t:(value)=>tr(value),
    set:updateLanguage,
    apply:applyLanguage
  };
})();
