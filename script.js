/* script.js VERSIONE AGGIORNATA E DAVVERO DIVERSA */
(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    lang: $("lang"),
    role: $("role"),
    recipient: $("recipient"),
    goal: $("goal"),
    tone: $("tone"),
    length: $("length"),
    name: $("name"),
    topic: $("topic"),
    mustInclude: $("mustInclude"),
    mustAvoid: $("mustAvoid"),
    extraInfo: $("extraInfo"),
    cta: $("cta"),
    clarify: $("clarify"),
    output: $("output"),
    outputTitle: $("outputTitle"),
    copy: $("copy"),
    copied: $("copied"),
    tabReady: $("tabReady"),
    tabPrompt: $("tabPrompt"),
  };

  let activeTab = "ready";

  const text = {
    it: {
      readyTitle: "Testo pronto",
      promptTitle: "Da incollare su AI",
      copy: "Copia",
      copied: "Copiato",
      copyFail: "Non riesco a copiare automaticamente. Seleziona il testo e copialo manualmente.",
      placeholdersNote: "Se un dettaglio manca, usa segnaposto come [nome], [data], [link].",
      greeting: "Ciao",
      closing: "Grazie",
      subjectPrefix: "Oggetto:",
      signatureLabel: "Firma:",
    },
    en: {
      readyTitle: "Ready to use text",
      promptTitle: "To paste into AI",
      copy: "Copy",
      copied: "Copied",
      copyFail: "Unable to copy automatically. Please select and copy manually.",
      placeholdersNote: "If a detail is missing, use placeholders like [name], [date], [link].",
      greeting: "Hi",
      closing: "Thanks",
      subjectPrefix: "Subject:",
      signatureLabel: "Signature:",
    },
  };

  const maps = {
    it: {
      recipient: {
        client: "cliente",
        recruiter: "recruiter",
        colleague: "collega",
        manager: "responsabile",
        lead: "potenziale cliente",
        other: "destinatario",
      },
      goalLabel: {
        book_call: "fissare una call",
        follow_up: "fare un follow up",
        send_quote: "inviare un preventivo",
        answer_complaint: "rispondere a un reclamo",
        request_info: "chiedere informazioni",
        other: "comunicare in modo chiaro",
      },
      tonePhrases: {
        professional: "in modo professionale e chiaro",
        friendly: "in modo amichevole e chiaro",
        direct: "in modo diretto e chiaro",
        persuasive: "in modo convincente e chiaro",
        neutral: "in modo neutro e chiaro",
      },
    },
    en: {
      recipient: {
        client: "client",
        recruiter: "recruiter",
        colleague: "colleague",
        manager: "manager",
        lead: "potential client",
        other: "recipient",
      },
      goalLabel: {
        book_call: "book a call",
        follow_up: "send a follow up",
        send_quote: "send a quote",
        answer_complaint: "answer a complaint",
        request_info: "request information",
        other: "communicate clearly",
      },
      tonePhrases: {
        professional: "in a professional and clear way",
        friendly: "in a friendly and clear way",
        direct: "in a direct and clear way",
        persuasive: "in a persuasive and clear way",
        neutral: "in a neutral and clear way",
      },
    },
  };

  function list(textareaValue) {
    return textareaValue
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  function lengthHint(lang, length) {
    if (lang === "it") {
      if (length === "short") return "Mantieni tutto molto breve.";
      if (length === "long") return "Aggiungi un po’ più contesto, ma resta semplice.";
      return "Mantieni una lunghezza media e leggibile.";
    }
    if (length === "short") return "Keep it very short.";
    if (length === "long") return "Add a bit more context, but keep it simple.";
    return "Keep a medium length and readable.";
  }

  function buildSubject(lang, goal, topic) {
    const base = (topic || "").trim();
    if (lang === "it") {
      if (base) return base.charAt(0).toUpperCase() + base.slice(1);
      if (goal === "book_call") return "Richiesta call";
      if (goal === "follow_up") return "Follow up";
      if (goal === "send_quote") return "Preventivo";
      if (goal === "answer_complaint") return "Riscontro alla tua segnalazione";
      if (goal === "request_info") return "Richiesta informazioni";
      return "Messaggio";
    } else {
      if (base) return base.charAt(0).toUpperCase() + base.slice(1);
      if (goal === "book_call") return "Call request";
      if (goal === "follow_up") return "Follow up";
      if (goal === "send_quote") return "Quote";
      if (goal === "answer_complaint") return "Reply to your message";
      if (goal === "request_info") return "Information request";
      return "Message";
    }
  }

  function buildReadyEmail() {
    const lang = els.lang.value;
    const t = text[lang];
    const m = maps[lang];

    const recipient = m.recipient[els.recipient.value];
    const goal = els.goal.value;
    const tone = els.tone.value;
    const length = els.length.value;

    const topic = (els.topic.value || "").trim();
    const include = list(els.mustInclude.value);
    const avoid = list(els.mustAvoid.value);
    const extra = (els.extraInfo.value || "").trim();
    const name = (els.name.value || "").trim() || (lang === "it" ? "Nome Cognome" : "First Last");

    const subject = buildSubject(lang, goal, topic);

    const lines = [];

    lines.push(`${t.subjectPrefix} ${subject}`);
    lines.push("");
    lines.push(`${t.greeting} ${lang === "it" ? "[Nome]" : "[Name]"},`);
    lines.push("");

    if (lang === "it") {
      lines.push(`Ti scrivo ${m.tonePhrases[tone]} in merito a ${topic ? topic : "questa richiesta"}.`);
      lines.push(`L’obiettivo è ${m.goalLabel[goal]}.`);
    } else {
      lines.push(`I am writing ${m.tonePhrases[tone]} regarding ${topic ? topic : "this request"}.`);
      lines.push(`The goal is to ${m.goalLabel[goal]}.`);
    }

    if (include.length) {
      lines.push("");
      lines.push(lang === "it" ? "Punti importanti:" : "Key points:");
      include.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`));
    }

    if (extra) {
      lines.push("");
      lines.push(lang === "it" ? `Dettagli: ${extra}` : `Details: ${extra}`);
    }

    if (goal === "book_call") {
      lines.push("");
      if (lang === "it") {
        lines.push("Se ti va, possiamo sentirci in call. Propongo due opzioni:");
        lines.push("1. [giorno] alle [ora]");
        lines.push("2. [giorno] alle [ora]");
      } else {
        lines.push("If you are open to it, we can jump on a call. Here are two options:");
        lines.push("1. [day] at [time]");
        lines.push("2. [day] at [time]");
      }
    }

    if (goal === "answer_complaint") {
      lines.push("");
      if (lang === "it") {
        lines.push("Mi dispiace per l’inconveniente. Sto verificando e ti aggiorno con una soluzione concreta.");
      } else {
        lines.push("I am sorry for the inconvenience. I am checking the details and will follow up with a concrete solution.");
      }
    }

    if (goal === "request_info") {
      lines.push("");
      if (lang === "it") {
        lines.push("Per procedere mi servirebbero queste informazioni:");
        lines.push("1. [informazione 1]");
        lines.push("2. [informazione 2]");
        lines.push("3. [informazione 3]");
      } else {
        lines.push("To proceed, I would need:");
        lines.push("1. [info 1]");
        lines.push("2. [info 2]");
        lines.push("3. [info 3]");
      }
    }

    if (avoid.length) {
      lines.push("");
      lines.push(lang === "it" ? "Nota per te: evita queste cose nel messaggio." : "Note to self: avoid these in the message.");
      avoid.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`));
    }

    lines.push("");
    if (els.cta.checked) {
      lines.push(lang === "it" ? "Fammi sapere come preferisci procedere." : "Let me know how you would like to proceed.");
    } else {
      lines.push(lang === "it" ? "Resto a disposizione." : "I remain available.");
    }

    lines.push("");
    lines.push(lang === "it" ? `${t.closing},` : `${t.closing},`);
    lines.push(`${t.signatureLabel} ${name}`);

    lines.push("");
    lines.push(lengthHint(lang, length));
    lines.push(t.placeholdersNote);

    return lines.join("\n");
  }

  function buildPasteToAIText() {
    const lang = els.lang.value;
    const m = maps[lang];

    const topic = (els.topic.value || "").trim();
    const include = list(els.mustInclude.value);
    const avoid = list(els.mustAvoid.value);
    const extra = (els.extraInfo.value || "").trim();

    const recipient = m.recipient[els.recipient.value];
    const goal = m.goalLabel[els.goal.value];
    const tone = m.tonePhrases[els.tone.value];
    const length = els.length.value;

    const parts = [];

    if (lang === "it") {
      parts.push("Sei un assistente esperto di email professionali.");
      parts.push("Obiettivo: scrivi un’email completa e pronta da inviare.");
      parts.push(`Destinatario: ${recipient}.`);
      parts.push(`Cosa devo ottenere: ${goal}.`);
      parts.push(`Stile: ${tone}.`);
      parts.push(`Lunghezza: ${length === "short" ? "breve" : length === "long" ? "più dettagliata" : "media"}.`);
      parts.push("");
      parts.push(`Argomento: ${topic || "non specificato, chiedi chiarimenti prima di scrivere"}.`);

      if (include.length) {
        parts.push("");
        parts.push("Deve includere questi punti:");
        include.forEach((item, idx) => parts.push(`${idx + 1}. ${item}`));
      }

      if (extra) {
        parts.push("");
        parts.push(`Dettagli utili: ${extra}`);
      }

      if (avoid.length) {
        parts.push("");
        parts.push("Evita queste cose:");
        avoid.forEach((item, idx) => parts.push(`${idx + 1}. ${item}`));
      }

      parts.push("");
      if (els.clarify.checked) {
        parts.push("Se mancano informazioni importanti, fai prima massimo 3 domande chiarificatrici, poi scrivi l’email.");
      } else {
        parts.push("Se mancano informazioni, usa segnaposto tra parentesi quadre come [nome], [data], [link].");
      }

      parts.push("Formato obbligatorio: oggetto, saluto, corpo chiaro, chiusura, firma.");
    } else {
      parts.push("You are an expert at professional emails.");
      parts.push("Goal: write a complete ready to send email.");
      parts.push(`Recipient: ${recipient}.`);
      parts.push(`What I want to achieve: ${goal}.`);
      parts.push(`Style: ${tone}.`);
      parts.push(`Length: ${length === "short" ? "short" : length === "long" ? "more detailed" : "medium"}.`);
      parts.push("");
      parts.push(`Topic: ${topic || "not specified, ask clarifying questions first"}.`);

      if (include.length) {
        parts.push("");
        parts.push("It must include:");
        include.forEach((item, idx) => parts.push(`${idx + 1}. ${item}`));
      }

      if (extra) {
        parts.push("");
        parts.push(`Useful details: ${extra}`);
      }

      if (avoid.length) {
        parts.push("");
        parts.push("Avoid:");
        avoid.forEach((item, idx) => parts.push(`${idx + 1}. ${item}`));
      }

      parts.push("");
      if (els.clarify.checked) {
        parts.push("If key information is missing, ask up to 3 clarifying questions first, then write the email.");
      } else {
        parts.push("If information is missing, use placeholders in square brackets such as [name], [date], [link].");
      }

      parts.push("Required format: subject, greeting, clear body, closing, signature.");
    }

    return parts.join("\n");
  }

  function setActiveTab(tab) {
    activeTab = tab;

    els.tabReady.classList.toggle("active", tab === "ready");
    els.tabPrompt.classList.toggle("active", tab === "prompt");

    const lang = els.lang.value;
    els.outputTitle.textContent = tab === "ready" ? text[lang].readyTitle : text[lang].promptTitle;

    render();
  }

  function getActiveOutput() {
    return activeTab === "ready" ? buildReadyEmail() : buildPasteToAIText();
  }

  function render() {
    const lang = els.lang.value;
    els.copy.textContent = text[lang].copy;
    els.output.textContent = getActiveOutput();
    els.copied.textContent = "";
    document.documentElement.lang = lang;
  }

  function attachListeners() {
    document.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    els.tabReady.addEventListener("click", () => setActiveTab("ready"));
    els.tabPrompt.addEventListener("click", () => setActiveTab("prompt"));

    els.copy.addEventListener("click", async () => {
      const lang = els.lang.value;
      try {
        await navigator.clipboard.writeText(els.output.textContent || "");
        els.copied.textContent = text[lang].copied;
        setTimeout(() => (els.copied.textContent = ""), 1200);
      } catch {
        alert(text[lang].copyFail);
      }
    });
  }

  attachListeners();
  setActiveTab("ready");
})();
