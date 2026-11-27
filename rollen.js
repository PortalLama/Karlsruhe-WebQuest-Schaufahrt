"use strict";

/**
 * Rollenfenster für den Projektauftrag.
 * Rollen sind Gesprächs- und Qualitätsverantwortlichkeiten; keine
 * getrennten Arbeitspakete und keine Person arbeitet allein an "ihrer" Phase.
 */
const ROLES = {
  lead: {
    title: "Projektleitung",
    intro: "Du behältst den Überblick über euren Forschungsauftrag und hilfst dabei, dass alle Teammitglieder zu Wort kommen. Du bist nicht die Person, die allein entscheidet – du unterstützt eure gemeinsamen Entscheidungen.",
    tasks: [
      "Besprecht zu Beginn, welchen der vier Orte ihr untersuchen möchtet, und haltet fest, welche Frage euch besonders interessiert.",
      "Achte darauf, dass die Gruppe ihre Arbeitsschritte gemeinsam plant: Quellen sichten, historische Aussage formulieren, Beitrag gestalten und überprüfen.",
      "Frage regelmäßig nach, ob alle die bisherigen Erkenntnisse verstanden haben und ob noch Widersprüche oder offene Fragen bestehen.",
      "Moderiert gemeinsam die Entscheidungen: Welche Quellen sind geeignet? Welche Botschaft soll euer Medienbeitrag vermitteln?",
      "Sorge vor der Abgabe dafür, dass ihr die Qualitätscheckliste durchgeht und jedes Teammitglied den fertigen Beitrag erklären kann."
    ],
    question: "Sind wir uns einig, was wir zeigen wollen – und können alle erklären, warum?"
  },
  sources: {
    title: "Quellen-Detektiv",
    intro: "Du achtest besonders darauf, dass eure Erkenntnisse wirklich auf historischen Quellen beruhen. Du hilfst deinem Team, Quellen sorgfältig zu untersuchen, statt Darstellungen oder Propaganda ungeprüft zu übernehmen.",
    tasks: [
      "Prüft gemeinsam bei jedem Material: Wer hat es wann, wo, für wen und mit welcher möglichen Absicht erstellt?",
      "Unterscheidet historische Originalquellen von späteren Darstellungen. Gerade nationalsozialistische Presseberichte zeigen auch die Perspektive und Ziele der Verfasser.",
      "Suche mit deinem Team nach ergänzenden Materialien und notiert für jeden Fund möglichst Titel, Datum, Urheber und Fundstelle oder Archivsignatur.",
      "Markiere zusammen mit den anderen konkrete Textstellen oder Bilddetails, die eure historische Aussage belegen – und besprecht, was die Quelle offenlässt.",
      "Kontrolliere vor der Veröffentlichung, ob die wichtigsten Aussagen durch nachvollziehbare Belege gedeckt sind und Materialien verwendet werden dürfen."
    ],
    question: "Woher wissen wir das genau – und welche Grenzen hat unsere Quelle?"
  },
  history: {
    title: "Historiker/in",
    intro: "Du behältst den historischen Zusammenhang im Blick: Was geschah 1933 bereits vor der Schaufahrt, wer war betroffen und weshalb hatte die öffentliche Vorführung gerade an diesem Ort eine besondere Bedeutung?",
    tasks: [
      "Ordnet die Ereignisse zeitlich ein: Welche Maßnahmen gegen politische Gegner gab es im Frühjahr 1933 bereits?",
      "Untersucht, welche Bedeutung euer Ort vor der nationalsozialistischen Machtübernahme für Politik, Öffentlichkeit oder Demokratie hatte.",
      "Vergleicht Perspektiven: Wie wurden die Gefangenen dargestellt, wie erlebten Betroffene die Verfolgung und was lässt sich über Zuschauende belegen?",
      "Formuliert gemeinsam eine Erklärung dafür, welche Botschaft die Nationalsozialisten mit der öffentlichen Demütigung verbreiten wollten.",
      "Achte beim Gegenwartsvergleich darauf, historische Unterschiede nicht zu verwischen: Staatlich organisierte Verfolgung in der NS-Diktatur ist nicht einfach dasselbe wie politische Konflikte oder Straftaten in einem heutigen Rechtsstaat."
    ],
    question: "Warum war dieser Ort 1933 bedeutsam – und welche Erklärung ist durch unsere Belege gedeckt?"
  },
  media: {
    title: "Medienredaktion",
    intro: "Du achtest besonders darauf, dass eure historischen Erkenntnisse verständlich, sorgfältig und ansprechend vermittelt werden. Du bestimmst das Medium nicht allein – alle wählen gemeinsam aus und gestalten mit.",
    tasks: [
      "Besprecht gemeinsam, ob ihr eure Station als Kurzvideo, kommentierte Bildergalerie, Präsentation oder in einer anderen geeigneten Form umsetzen möchtet.",
      "Entwickelt zusammen einen kurzen Ablaufplan: Wie führt ihr zum Ort hin, welche Quelle zeigt ihr und wie erklärt ihr ihre Bedeutung?",
      "Achte darauf, dass eine Person ohne Vorwissen die Erklärung versteht. Fachbegriffe brauchen eine knappe und richtige Erläuterung.",
      "Prüft Bildausschnitte, Quellenbeschriftungen, Lesbarkeit, Ton, Untertitel und die Rechte an verwendeten Materialien.",
      "Organisiere mit den anderen einen abschließenden Redaktionscheck: Ist die Aussage verständlich, quellenbelegt und im Umgang mit den Verfolgten respektvoll?"
    ],
    question: "Versteht jemand aus einer anderen Klasse unseren Beitrag – und erkennt, welche Quelle unsere Aussage stützt?"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("role-dialog");
  if (!dialog) return;
  const closeButton = document.getElementById("role-dialog-close");
  const doneButton = document.getElementById("role-dialog-done");
  const cards = [...document.querySelectorAll(".role-card[data-role]")];
  let trigger = null;

  function closeRole() {
    if (dialog.open) dialog.close();
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      const role = ROLES[card.dataset.role];
      if (!role) return;
      trigger = card;

      document.getElementById("role-dialog-title").textContent = role.title;
      document.getElementById("role-dialog-intro").textContent = role.intro;
      document.getElementById("role-dialog-question").textContent = role.question;
      document.getElementById("role-dialog-count").textContent = String(index + 1).padStart(2, "0") + " / 04";

      const list = document.getElementById("role-dialog-tasks");
      list.replaceChildren();
      role.tasks.forEach(text => {
        const item = document.createElement("li");
        item.textContent = text;
        list.append(item);
      });

      const icon = document.getElementById("role-dialog-icon");
      const sourceIcon = card.querySelector("svg");
      icon.replaceChildren(sourceIcon.cloneNode(true));

      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeRole);
  doneButton.addEventListener("click", closeRole);

  // Klick auf den Abdunklungsbereich schließt das Fenster.
  dialog.addEventListener("click", event => {
    if (event.target === dialog) closeRole();
  });

  // Zurück zur auslösenden Rollenkarte, auch nach Escape.
  dialog.addEventListener("close", () => {
    if (trigger) trigger.focus();
  });
});
