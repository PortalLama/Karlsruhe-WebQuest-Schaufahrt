"use strict";
/**
 * Karlsruhe erinnert · zentrale Vergabe der vier Forschungsstationen.
 * Eine Station = genau ein angemeldetes Gruppen-/Projektkonto.
 * Der PRIMARY KEY station_id verhindert Doppelbuchungen auf Serverebene.
 * Der UNIQUE owner_id verhindert mehrere Stationen pro Gruppenaccount.
 * Alle Mutationen werden durch Supabase Auth und Row Level Security geprüft.
 *
 * Ohne supabase/station_assignments_migration.sql bleibt die Website
 * lesbar, aber die Belegungsfunktion zeigt einen Einrichtungshinweis.
 */
(() => {
  const TABLE = "station_assignments";
  const STATION_NAMES = ["Gefängnis","Kanzlei Marum","Volksfreund","Ständehaus"];
  const cfg = window.WEBQUEST_DB_CONFIG || {};
  const configured = /^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(cfg.url || "")
    && typeof cfg.publishableKey === "string"
    && cfg.publishableKey.startsWith("sb_publishable_")
    && typeof window.supabase?.createClient === "function";
  // Derselbe Browser-Auth-Speicher wie auf database.html.
  const client = configured
    ? window.supabase.createClient(cfg.url, cfg.publishableKey)
    : null;
  if (client) window.WQ_SHARED_SUPABASE = client;

  const state = {
    station:1, user:null, assignments:[], ready:false, loading:true,
    busy:false, error:"", notice:"", requests:0, lastRefresh:0
  };
  const id = name => document.getElementById(name);
  const ownAssignment = () => state.user
    ? state.assignments.find(item => item.owner_id === state.user.id)
    : null;
  const assignedTo = station => state.assignments.find(item => item.station_id === station);
  // Immer deutsche Quelltexte einsetzen. Das zentrale i18n-Skript
  // übersetzt DOM-Textknoten und kann so beim Sprachenwechsel wieder
  // korrekt zur deutschen Originalfassung zurückkehren.
  function setText(node, value) {
    if (node) node.textContent = value;
  }

  function renderBadges() {
    const buttons = id("station-buttons")?.querySelectorAll(".station-btn") || [];
    buttons.forEach((button,index) => {
      const area = button.children[1] || button;
      let chip = area.querySelector(".reservation-mini");
      if (!chip) {
        chip = document.createElement("span");
        chip.className = "reservation-mini";
        area.appendChild(chip);
      }
      const claim = assignedTo(index+1);
      const mine = claim && state.user && claim.owner_id === state.user.id;
      if (!state.ready) {
        setText(chip, "Belegung nicht eingerichtet");
        chip.dataset.state = "inactive";
      } else if (claim) {
        setText(chip, mine ? "Eure Station" : "Bereits vergeben");
        chip.dataset.state = mine ? "own" : "occupied";
        chip.title = claim.group_name;
      } else {
        setText(chip, "Noch frei");
        chip.dataset.state = "free";
        chip.removeAttribute("title");
      }
    });
    const count = state.assignments.length;
    setText(id("reservation-counter"),
      state.ready ? count+" von 4 belegt" : "Belegung noch nicht aktiv");
  }

  function render() {
    const station = state.station, claim = assignedTo(station), mine = ownAssignment();
    const status = id("reservation-state");
    const box = id("reservation-panel");
    const actions = id("reservation-actions");
    const form = id("reservation-claim-form");
    const release = id("reservation-release");
    const login = id("reservation-login");
    const account = id("reservation-account");
    const accountText = id("reservation-account-text");
    const actionButton = id("reservation-claim-button");

    box.dataset.state = !state.ready ? "inactive" : claim ? "occupied" : "free";
    // Bei Hintergrund-Aktualisierungen die Eingabe nicht ausblenden.
    actions.hidden = !state.ready;
    form.hidden = true;
    release.hidden = true;
    login.hidden = true;
    account.hidden = !state.user;
    setText(accountText, state.user ? "Projektkonto angemeldet" : "");
    actionButton.disabled = state.busy;

    if (!client) {
      setText(status,"Die Belegung ist noch nicht mit Supabase verbunden. Bitte die Lehrkraft informieren.");
    } else if (state.loading) {
      setText(status,"Stationsbelegungen werden geladen …");
    } else if (!state.ready) {
      setText(status,"Die Stationsvergabe ist noch nicht eingerichtet. Die Lehrkraft muss die SQL-Erweiterung aktivieren.");
    } else if (state.busy) {
      setText(status,"Die Belegung wird gespeichert …");
    } else if (claim && state.user && claim.owner_id === state.user.id) {
      setText(status,"Diese Station gehört eurer Gruppe: "+claim.group_name+".");
      release.hidden = false;
    } else if (claim) {
      setText(status,"Bereits vergeben an "+claim.group_name+". Bitte wählt einen anderen Ort.");
    } else if (mine) {
      setText(status,"Noch frei. Euer Konto hat aber bereits Station "+String(mine.station_id).padStart(2,"0")+" – "+STATION_NAMES[mine.station_id-1]+" übernommen.");
    } else if (!state.user) {
      setText(status,"Noch frei. Meldet euch mit eurem Gruppenkonto an, um diese Station zu übernehmen.");
      login.hidden = false;
    } else {
      setText(status,"Noch frei. Ihr könnt diesen Ort jetzt verbindlich für eure Gruppe auswählen.");
      form.hidden = false;
    }

    const feedback = id("reservation-feedback");
    setText(feedback,state.notice || state.error || "");
    feedback.dataset.state = state.error ? "error" : "notice";
    renderBadges();
  }

  async function loadAssignments() {
    if (!client) {
      state.loading=false; state.ready=false; state.error="";
      render(); return;
    }
    const currentRequest=++state.requests;
    state.lastRefresh=Date.now();
    state.loading=true;
    render();
    try {
      // getUser() prüft die Sitzung mit Supabase Auth; wir vertrauen
      // keiner bloß lokal gespeicherten E-Mail-Adresse.
      const {data:account,error:authError}=await client.auth.getUser();
      if(currentRequest!==state.requests)return;
      state.user=authError?null:(account?.user||null);
      const columns=state.user
        ? "station_id,group_name,owner_id"
        : "station_id,group_name";
      const {data,error}=await client.from(TABLE)
        .select(columns).order("station_id",{ascending:true});
      if(currentRequest!==state.requests)return;
      if(error)throw error;
      state.assignments=Array.isArray(data)?data:[];
      state.ready=true;state.error="";
    }catch(error){
      if(currentRequest!==state.requests)return;
      state.ready=false;
      state.assignments=[];
      state.error=error?.message || "Die Belegung ist derzeit nicht erreichbar.";
      console.warn("Stationsbelegungen konnten nicht abgerufen werden:",error);
    }finally{
      if(currentRequest===state.requests){state.loading=false;render();}
    }
  }

  async function claimStation(event) {
    event.preventDefault();
    if(state.busy||!state.ready||!state.user)return;
    const target=state.station;
    if(assignedTo(target)||ownAssignment()){
      state.error="Die Station ist bereits vergeben oder euer Konto hat bereits einen anderen Ort.";
      render();return;
    }
    const field=id("reservation-group-name");
    const name=field.value.trim();
    if(name.length<3||name.length>32||!/^[\p{L}\d ._-]+$/u.test(name)){
      state.error="Bitte einen neutralen Gruppennamen mit 3 bis 32 Zeichen eingeben (z. B. Gruppe A).";
      render();return;
    }
    state.busy=true;state.error="";state.notice="";render();
    try {
      const {error}=await client.from(TABLE)
        .insert({station_id:target,group_name:name});
      if(error){
        if(error.code==="23505" || /duplicate key/i.test(error.message || "")){
          state.error="Diese Station wurde inzwischen von einer anderen Gruppe übernommen – oder euer Konto hat bereits eine Station.";
        } else {
          state.error="Belegung fehlgeschlagen. Prüft eure Anmeldung und die Zugriffsrechte.";
        }
      } else {
        state.notice="Erfolgreich eingetragen. Eure Station ist nun für andere Gruppen gesperrt.";
        field.value="";
      }
    }catch(e){state.error="Die Station konnte nicht gespeichert werden. Bitte erneut versuchen.";}
    finally {
      state.busy=false;
      await loadAssignments();
    }
  }

  async function releaseStation() {
    if(!state.user||state.busy)return;
    const mine=ownAssignment(),target=state.station;
    if(!mine||mine.station_id!==target)return;
    if(!window.confirm("Möchtet ihr eure Belegung wirklich aufheben? Danach können andere Gruppen diese Station übernehmen."))return;
    state.busy=true;state.error="";state.notice="";render();
    try {
      const {error}=await client.from(TABLE).delete()
        .eq("station_id",target).eq("owner_id",state.user.id);
      if(error)throw error;
      state.notice="Eure Belegung wurde aufgehoben. Die Station ist wieder frei.";
    }catch(e){
      state.error="Die Belegung konnte nicht aufgehoben werden. Bitte die Lehrkraft informieren.";
    }finally{
      state.busy=false;
      await loadAssignments();
    }
  }

  async function login(event) {
    event.preventDefault();
    if(!client||state.busy)return;
    const form=event.currentTarget;
    const email=form.elements.namedItem("email").value.trim();
    const password=form.elements.namedItem("password").value;
    if(!email||!password)return;
    state.busy=true;state.error="";state.notice="";render();
    try {
      const {error}=await client.auth.signInWithPassword({email,password});
      if(error)throw error;
      form.reset();
      state.notice="Projektkonto angemeldet.";
    }catch(e){
      state.error="Anmeldung fehlgeschlagen. Prüft die Zugangsdaten eures Projektkontos.";
    }finally {
      state.busy=false;
      await loadAssignments();
    }
  }

  async function logout() {
    if(!client||state.busy)return;
    state.busy=true;state.error="";state.notice="";
    render();
    try {
      const {error}=await client.auth.signOut();
      if(error)throw error;
      state.user=null;
      state.notice="Projektkonto abgemeldet.";
    }catch(e){state.error="Abmelden fehlgeschlagen. Versucht es erneut.";}
    finally {
      state.busy=false;
      await loadAssignments();
    }
  }

  function init() {
    id("reservation-claim-form").addEventListener("submit",event=>void claimStation(event));
    id("reservation-login-form").addEventListener("submit",event=>void login(event));
    id("reservation-release").addEventListener("click",()=>void releaseStation());
    id("reservation-logout").addEventListener("click",()=>void logout());
    id("reservation-refresh").addEventListener("click",()=>void loadAssignments());
    document.addEventListener("wq-station-change",event=>{
      state.station=event.detail?.station||1;
      state.notice="";state.error="";
      render();
    });
    if(client){
      client.auth.onAuthStateChange(()=>{
        // Supabase-Queries nicht synchron in einem Auth-Callback ausführen.
        setTimeout(()=>void loadAssignments(),0);
      });
    }
    void loadAssignments();
    // Während die Karte geöffnet ist, werden neue Gruppenbelegungen
    // im Abstand von 20 Sekunden sichtbar. Echte Konflikte entscheidet
    // immer der UNIQUE-Constraint in Supabase, nicht diese Anzeige.
    setInterval(()=>{
      if(!document.hidden&&!state.busy&&Date.now()-state.lastRefresh>=19000){
        void loadAssignments();
      }
    },20000);
    window.addEventListener("focus",()=>{
      if(Date.now()-state.lastRefresh>7000)void loadAssignments();
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})();
