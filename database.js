"use strict";

/**
 * Karlsruhe erinnert · Forschungsarchiv V1
 * Die öffentliche Website liefert nur die Oberfläche.
 * Zentral gespeichert wird ausschließlich nach Supabase-Einrichtung.
 * Keine Uploads, kein versteckter lokaler Ersatzspeicher.
 * Row Level Security in supabase/schema.sql entscheidet serverseitig,
 * wer welche Einträge lesen oder verändern darf.
 */
(() => {
  const KIND = Object.freeze({
    quelle: "Historische Quelle",
    darstellung: "Historische Darstellung",
    bild: "Bild / Fotografie",
    video: "Video / Audio",
    link: "Weiterführender Link"
  });
  const PLACE = Object.freeze({
    1: "01 – Gefängnis Riefstahlstraße",
    2: "02 – Kanzlei Ludwig Marum",
    3: "03 – Volksfreund-Redaktion",
    4: "04 – Badisches Ständehaus"
  });
  const STATUS = Object.freeze({
    pending: "Zur Prüfung eingereicht",
    approved: "Freigegeben",
    rejected: "Nicht freigegeben"
  });

  const el = (id) => document.getElementById(id);
  const make = (tag, cls, content) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (content !== undefined && content !== null) n.textContent = String(content);
    return n;
  };
  const msg = (text) => {
    const p = el("archive-form-message");
    p.textContent = text || "";
  };
  const state = {
    client: null,
    user: null,
    items: [],
    editingId: null,
    selected: null,
    ready: false,
    loading: false
  };

  function secureUrl(raw) {
    try {
      const u = new URL(String(raw).trim());
      return u.protocol === "https:" && !u.username && !u.password && Boolean(u.hostname);
    } catch { return false; }
  }

  function showConnection(title, description, connected) {
    el("archive-status-title").textContent = title;
    el("archive-status-description").textContent = description;
    const node = el("archive-status");
    node.classList.toggle("archive-connected", Boolean(connected));
    node.classList.toggle("archive-disconnected", !connected);
  }

  function setAuthUi() {
    const form = el("archive-login-form");
    const signedIn = Boolean(state.user);
    const connected = Boolean(state.client);
    form.hidden = signedIn;
    el("archive-logout").hidden = !signedIn;
    el("archive-add").disabled = !signedIn;
    el("archive-login-button").disabled = !connected;
    for (const control of form.querySelectorAll("input")) control.disabled = !connected;
    el("archive-session-text").textContent = signedIn
      ? "Angemeldet. Du kannst neue Quellen und Links zur Prüfung einreichen und eigene offene Einträge bearbeiten."
      : connected
        ? "Mit einem freigegebenen Projektkonto kannst du Quellen und Links einreichen. Freigegebene Materialien sind auch ohne Anmeldung sichtbar."
        : "Die gemeinsame Speicherung ist noch nicht verbunden. Das Formular wird nach der Einrichtung aktiv.";
  }

  function dateLabel(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("de-DE", {day:"2-digit",month:"2-digit",year:"numeric"}).format(d);
  }

  function filteredItems() {
    const q = el("archive-search").value.trim().toLocaleLowerCase("de");
    const station = el("archive-station-filter").value;
    const kind = el("archive-type-filter").value;
    const view = el("archive-view-filter").value;
    return state.items.filter(item => {
      if (view === "mine") {
        if (!state.user || item.owner_id !== state.user.id) return false;
      } else if (item.review_status !== "approved") {
        return false; // Offene Beiträge nur im persönlichen Bereich anzeigen
      }
      if (station !== "all") {
        if (station === "general" && item.station !== null) return false;
        if (station !== "general" && String(item.station) !== station) return false;
      }
      if (kind !== "all" && item.kind !== kind) return false;
      if (q) {
        const haystack = [
          item.title, item.description, item.author,
          item.historical_date, item.source_reference,
          PLACE[item.station] || "übergreifend", KIND[item.kind] || ""
        ].join(" ").toLocaleLowerCase("de");
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  function renderItems() {
    const container = el("archive-results");
    container.replaceChildren();
    const data = filteredItems();
    const view = el("archive-view-filter").value;
    el("archive-count").textContent =
      data.length === 1 ? "1 Material" : data.length + " Materialien";

    if (!state.client) {
      container.append(emptyState("Noch nicht mit einem gemeinsamen Archiv verbunden.",
        "Die Benutzeroberfläche ist vorbereitet. Nach dem Anlegen des Supabase-Projekts und der sicheren Zugriffsregeln werden hier die echten Einträge angezeigt."));
      return;
    }
    if (view === "mine" && !state.user) {
      container.append(emptyState("Bitte zuerst anmelden.",
        "Die persönlichen Einreichungen sind nur für das jeweilige Projektkonto sichtbar."));
      return;
    }
    if (!data.length) {
      container.append(emptyState(
        state.items.length ? "Keine Treffer für diese Filter." : "Noch keine Materialien vorhanden.",
        state.items.length ? "Passe deine Suche oder die Filter an." :
          "Neue Einreichungen werden zunächst geprüft. Freigegebene Materialien erscheinen anschließend in der Übersicht."
      ));
      return;
    }

    for (const item of data) {
      const article = make("article","archive-item");
      const top = make("div","archive-item-top");
      const icon = make("span","archive-item-icon",
        item.kind === "bild" ? "▧" :
        item.kind === "video" ? "▷" :
        item.kind === "quelle" ? "▤" :
        item.kind === "darstellung" ? "▥" : "↗");
      icon.setAttribute("aria-hidden","true");
      const badge = make("span","archive-item-type",KIND[item.kind] || "Material");
      top.append(icon,badge);
      article.append(top);
      article.append(make("h4","archive-item-title",item.title));
      article.append(make("p","archive-item-station",PLACE[item.station] || "Alle Stationen"));
      article.append(make("p","archive-item-description",item.description));
      const info = make("div","archive-item-info");
      info.append(make("span","",item.author || "Urheber unbekannt"));
      if(item.historical_date) info.append(make("span","",item.historical_date));
      article.append(info);
      if (view === "mine") {
        const status = make("span","archive-review archive-review-"+item.review_status,
          STATUS[item.review_status] || "Status unbekannt");
        article.append(status);
      }
      const buttons = make("div","archive-item-actions");
      const detail = make("button","archive-detail-button","Details ansehen");
      detail.type="button";
      detail.addEventListener("click",() => openDetail(item));
      buttons.append(detail);
      if (secureUrl(item.material_url)) {
        const anchor = make("a","archive-link-button","Material öffnen ↗");
        anchor.href=item.material_url;
        anchor.target="_blank";
        anchor.rel="noopener noreferrer";
        buttons.append(anchor);
      }
      article.append(buttons);
      container.append(article);
    }
  }

  function emptyState(title, description) {
    const box=make("div","archive-empty");
    const ico=make("span","archive-empty-icon","▧");
    ico.setAttribute("aria-hidden","true");
    box.append(ico,make("strong","",title),make("p","",description));
    return box;
  }

  function detailLine(parent, name, value) {
    if (!value) return;
    const field = make("div","archive-detail-field");
    field.append(make("dt","",name),make("dd","",value));
    parent.append(field);
  }

  function openDetail(item) {
    state.selected = item;
    const d=el("archive-detail-dialog");
    const content=el("archive-detail-content");
    const actions=el("archive-detail-actions");
    content.replaceChildren(); actions.replaceChildren();
    content.append(make("p","section-kicker",KIND[item.kind] || "MATERIAL"),
      make("h2","",item.title));
    const dl=make("dl","archive-detail-fields");
    detailLine(dl,"Station",PLACE[item.station] || "Übergreifend");
    detailLine(dl,"Urheber / Verfasser",item.author || "Nicht angegeben");
    detailLine(dl,"Entstehungszeit",item.historical_date || "Nicht angegeben");
    detailLine(dl,"Archiv / Fundstelle",item.source_reference);
    detailLine(dl,"Erläuterung und Hinweise",item.description);
    detailLine(dl,"Eingereicht am",dateLabel(item.created_at));
    detailLine(dl,"Status",STATUS[item.review_status] || "Unbekannt");
    content.append(dl);

    if (secureUrl(item.material_url)) {
      const a=make("a","archive-button archive-button-primary","Material extern öffnen ↗");
      a.href=item.material_url;
      a.target="_blank";
      a.rel="noopener noreferrer";
      actions.append(a);
    }
    const canEdit=Boolean(state.user) && item.owner_id === state.user.id
      && item.review_status === "pending";
    if(canEdit) {
      const edit=make("button","archive-button archive-button-secondary","Bearbeiten");
      edit.type="button";
      edit.addEventListener("click",() => {
        d.close();
        openEditor(item);
      });
      const remove=make("button","archive-button archive-button-danger","Löschen");
      remove.type="button";
      remove.addEventListener("click",() => removeOwn(item));
      actions.append(edit,remove);
    }
    d.showModal();
  }

  function openEditor(item) {
    if (!state.user) return;
    const form=el("archive-entry-form");
    form.reset(); msg("");
    state.editingId=item?.id || null;
    el("archive-entry-title").textContent=item ? "Material bearbeiten" : "Neues Material";
    el("archive-entry-submit").textContent=item ? "Änderungen speichern" : "Zur Prüfung einreichen";
    if(item) {
      for(const field of ["title","kind","author","historical_date","source_reference","description","material_url"]) {
        form.elements.namedItem(field).value=item[field] || "";
      }
      form.elements.namedItem("station").value=item.station === null ? "" : String(item.station);
    }
    el("archive-entry-dialog").showModal();
    form.elements.namedItem("title").focus();
  }

  async function removeOwn(item) {
    if (!state.client || !state.user) return;
    if (!window.confirm("Diese noch nicht freigegebene Einreichung endgültig löschen?")) return;
    const { error } = await state.client.from("research_materials")
      .delete().eq("id",item.id);
    if(error){ window.alert("Löschen nicht möglich: "+error.message);return; }
    el("archive-detail-dialog").close();
    await loadItems();
  }

  function cleanText(value) { return String(value || "").trim(); }

  function formPayload(form) {
    const f=(name) => cleanText(form.elements.namedItem(name)?.value);
    const station=f("station");
    return {
      title:f("title"),
      kind:f("kind"),
      station:station === "" ? null : Number(station),
      author:f("author"),
      historical_date:f("historical_date"),
      source_reference:f("source_reference"),
      description:f("description"),
      material_url:f("material_url")
    };
  }

  async function saveMaterial(event) {
    event.preventDefault();
    if (!state.client || !state.user) { msg("Bitte erst mit einem Projektkonto anmelden.");return; }
    const form=event.currentTarget;
    if(!form.reportValidity())return;
    const payload=formPayload(form);
    if (!secureUrl(payload.material_url)) {
      msg("Bitte einen gültigen HTTPS-Link ohne Zugangsdaten eintragen.");
      return;
    }
    const btn=el("archive-entry-submit");
    btn.disabled=true;msg("Eintrag wird gespeichert …");
    let response;
    try {
      if (state.editingId) {
        response = await state.client.from("research_materials")
          .update(payload).eq("id",state.editingId).select("id").single();
      } else {
        response = await state.client.from("research_materials")
          .insert(payload).select("id").single();
      }
      if (response.error) throw response.error;
      el("archive-entry-dialog").close();
      el("archive-view-filter").value="mine";
      await loadItems();
    } catch(e) {
      msg("Speichern fehlgeschlagen: "+(e.message || "Bitte Eingaben und Zugriffsrechte prüfen."));
    } finally { btn.disabled=false; }
  }

  async function loadItems() {
    if (!state.client || state.loading) return;
    state.loading=true;
    el("archive-count").textContent="Lade Materialien …";
    try {
      const {data,error} = await state.client.from("research_materials")
        .select("id,title,kind,station,author,historical_date,source_reference,description,material_url,owner_id,review_status,created_at")
        .order("created_at",{ascending:false}).limit(250);
      if(error) throw error;
      state.items=Array.isArray(data)?data:[];
      showConnection("Gemeinsames Forschungsarchiv verbunden",
        "Freigegebene Materialien sind sichtbar. Eigene Entwürfe erscheinen nach Anmeldung im Bereich „Meine Einreichungen“.",true);
    } catch(e){
      state.items=[];
      showConnection("Die Materialsammlung kann nicht geladen werden",
        "Bitte SQL-Schema, Projektkonfiguration und Zugriffsrechte prüfen. "+(e.message || ""),false);
    } finally {state.loading=false;renderItems();}
  }

  async function refreshAuth() {
    if (!state.client) return;
    try {
      const {data} = await state.client.auth.getUser();
      state.user=data.user || null;
    } catch {state.user=null;}
    setAuthUi();
    await loadItems();
  }

  async function login(event) {
    event.preventDefault();
    if (!state.client) return;
    const form=event.currentTarget;
    const email=cleanText(form.elements.namedItem("email").value);
    const password=form.elements.namedItem("password").value;
    const button=el("archive-login-button");
    button.disabled=true;
    el("archive-session-text").textContent="Anmeldung läuft …";
    try {
      const {data,error}=await state.client.auth.signInWithPassword({email,password});
      if(error) throw error;
      state.user=data.user || null;
      form.reset();
      setAuthUi();
      await loadItems();
    }catch(e){
      el("archive-session-text").textContent="Anmeldung fehlgeschlagen. Prüfe E-Mail, Passwort und Projektfreigabe. "+(e.message || "");
    }finally{button.disabled=false;}
  }

  async function logout() {
    if (!state.client) return;
    const {error}=await state.client.auth.signOut();
    if (error) { window.alert("Abmelden fehlgeschlagen: "+error.message);return;}
    state.user=null;
    el("archive-view-filter").value="all";
    setAuthUi();
    await loadItems();
  }

  function bindEvents() {
    for(const id of ["archive-search","archive-station-filter","archive-type-filter","archive-view-filter"]){
      el(id).addEventListener(id==="archive-search"?"input":"change",renderItems);
    }
    el("archive-refresh").addEventListener("click",loadItems);
    el("archive-add").addEventListener("click",() => openEditor(null));
    el("archive-login-form").addEventListener("submit",login);
    el("archive-logout").addEventListener("click",logout);
    el("archive-entry-form").addEventListener("submit",saveMaterial);
    for(const button of document.querySelectorAll("[data-close]")){
      button.addEventListener("click",() => {
        const dialog=el(button.dataset.close);
        if(dialog?.open)dialog.close();
      });
    }
    for(const id of ["archive-entry-dialog","archive-detail-dialog"]){
      const d=el(id);
      d.addEventListener("click",(e) => {
        if(e.target === d) d.close();
      });
    }
  }

  async function init() {
    bindEvents();
    setAuthUi();
    const cfg=window.WEBQUEST_DB_CONFIG || {};
    const validConfig=secureUrl(cfg.url) && typeof cfg.publishableKey === "string"
      && cfg.publishableKey.startsWith("sb_publishable_");
    if(!validConfig){
      showConnection("Database wartet auf die Supabase-Verbindung",
        "Die Oberfläche ist fertig. Es sind noch keine Zugangsdaten für die gemeinsame Speicherung hinterlegt. Ohne Verbindung werden keine Materialien gespeichert.",false);
      renderItems();
      return;
    }
    if (!window.supabase?.createClient) {
      showConnection("Datenbankbibliothek konnte nicht geladen werden",
        "Bitte Internetverbindung prüfen und die Seite neu laden.",false);
      renderItems();return;
    }
    try {
      state.client=window.supabase.createClient(cfg.url,cfg.publishableKey);
      state.ready=true;
      state.client.auth.onAuthStateChange(() => {
        // Keine Supabase-Queries direkt aus der Auth-Callback-Ausführung.
        setTimeout(() => {refreshAuth();},0);
      });
      await refreshAuth();
    }catch(e){
      state.client=null;
      showConnection("Verbindung fehlgeschlagen",
        "Supabase-Projekt und Konfiguration überprüfen. "+(e.message||""),false);
      setAuthUi();renderItems();
    }
  }
  document.addEventListener("DOMContentLoaded",init);
})();
