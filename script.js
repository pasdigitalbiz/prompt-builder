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
    copy: $("copy"),
    copied: $("copied"),
  };

  let variant = "standard";

  const copy = {
    it: {
      roleBlock:
        "Sei un assistente esperto di comunicazione professionale. Scrivi email chiare, sintetiche e orientate all’azione. Mantieni un tono coerente e non inventare dettagli.",
      contextHeader: "CONTESTO",
      inputHeader: "INPUT",
      styleHeader: "STILE",
      rulesHeader: "REGOLE",
      outputHeader: "FORMATO OUTPUT OBBLIGATORIO",
      language: "Lingua",
      sender: "Mittente",
      recipient: "Destinatario",
      goal: "Obiettivo",
      topic: "Argomento",
      mustInclude: "Punti da includere",
      mustAvoid: "Da evitare",
      extraInfo: "Informazioni utili",
      tone: "Tono",
      length: "Lunghezza",
      none: "Nessuno",
      topicPlaceholder: "Inserisci un argomento chiaro in una frase",
      noInvent:
        "Non inventare dati, numeri, promesse o fatti. Se mancano informazioni importanti, gestisci la mancanza in modo esplicito.",
      clarifyOn:
        "Se mancano informazioni cruciali per scrivere una buona email, fai prima massimo 3 domande chiarificatrici. Poi scrivi l’email completa.",
      clarifyOff:
        "Se mancano informazioni, non fare domande: scrivi una versione ragionevole usando segnaposto chiari tra parentesi quadre, ad esempio [nome], [data], [link].",
      ctaOn: "Concludi con una call to action chiara e concreta.",
      ctaOff: "Non inserire call to action, chiudi in modo neutro.",
      lengthRule: {
        short: "Mantieni l’email sotto 120 parole, frasi brevi e 1 solo obiettivo.",
        medium: "Mantieni l’email tra 120 e 200 parole, con paragrafi brevi.",
        long: "Puoi arrivare a 250 parole se serve, ma resta leggibile e strutturato.",
      },
      goalRule: {
        book_call: "Proponi 2 opzioni di orario o un modo semplice per prenotare. Riduci frizioni e rendi facile dire sì.",
        follow_up: "Fai riferimento al contatto precedente e chiedi un aggiornamento con una domanda chiusa o una richiesta specifica.",
        send_quote: "Presenta il preventivo in modo ordinato, chiarisci cosa include e cosa serve per procedere.",
        answer_complaint: "Usa tono empatico, riconosci il problema, proponi una soluzione concreta e un next step.",
        request_info: "Spiega perché ti servono le informazioni e chiedile in elenco puntato, minimo indispensabile.",
        other: "Sii chiaro, specifico e orientato al risultato. Evita giri di parole.",
      },
      outputFormat:
        "1 Oggetto email\n2 Saluto\n3 Corpo con paragrafi brevi\n4 Call to action o chiusura coerente con le regole\n5 Firma con {name}",
      variantShort:
        "VARIANTE BREVE: massima sintesi. Niente frasi generiche. Se possibile, usa un solo paragrafo nel corpo.",
      variantDetailed:
        "VARIANTE DETTAGLIATA: dopo l’email, aggiungi una checklist di 5 punti per verificare chiarezza e completezza.",
      detailedExplain:
        "DOPO L’EMAIL: spiega in 3 righe perché questa struttura funziona in base a chiarezza, contesto e obiettivo.",
      detailedAlt:
        "POI: proponi una variante alternativa più diretta mantenendo lo stesso significato.",
      copyOk: "Copiato",
      copyFail: "Non riesco a copiare. Seleziona e copia manualmente.",
    },
    en: {
      roleBlock:
        "You are an expert in professional communication. Write clear, concise, action oriented emails. Keep the tone consistent and do not invent details.",
      contextHeader: "CONTEXT",
      inputHeader: "INPUT",
      styleHeader: "STYLE",
      rulesHeader: "RULES",
      outputHeader: "REQUIRED OUTPUT FORMAT",
      language: "Language",
      sender: "Sender",
      recipient: "Recipient",
      goal: "Goal",
      topic: "Topic",
      mustInclude: "Must include",
      mustAvoid: "Must avoid",
      extraInfo: "Useful info",
      tone: "Tone",
      length: "Length",
      none: "None",
      topicPlaceholder: "Provide a clear one sentence topic",
      noInvent:
        "Do not invent data, numbers, promises, or facts. If key information is missing, handle the gap explicitly.",
      clarifyOn:
        "If crucial information is missing to write a strong email, ask up to 3 clarifying questions first. Then write the full email.",
      clarifyOff:
        "If information is missing, do not ask questions: write a reasonable draft using clear placeholders in square brackets, e.g., [name], [date], [link].",
      ctaOn: "End with a clear, concrete call to action.",
      ctaOff: "Do not include a call to action. Close neutrally.",
      lengthRule: {
        short: "Keep the email under 120 words, short sentences, one main objective.",
        medium: "Keep the email between 120 and 200 words, with short paragraphs.",
        long: "You may go up to 250 words if needed, but keep it readable and structured.",
      },
      goalRule: {
        book_call: "Propose 2 time slot options or a simple way to book. Reduce friction and make it easy to say yes.",
        follow_up: "Reference the previous touchpoint and ask for an update with a closed question or a specific request.",
        send_quote: "Present the quote clearly, state what is included, and what is needed to proceed.",
        answer_complaint: "Use an empathetic tone, acknowledge the issue, offer a concrete solution, and a next step.",
        request_info: "Explain why you need the information and ask for it as a minimal bullet list.",
        other: "Be clear, specific, and outcome focused. Avoid fluff.",
      },
      outputFormat:
        "1 Email subject\n2 Greeting\n3 Body with short paragraphs\n4 Call to action or consistent closing\n5 Signature with {name}",
      variantShort:
        "SHORT VARIANT: maximum brevity. No generic phrases. If possible, use a single paragraph body.",
      variantDetailed:
        "DETAILED VARIANT: after the email, add a 5 point checklist to verify clarity and completeness.",
      detailedExplain:
        "AFTER THE EMAIL: explain in 3 lines why this structure works based on clarity, context, and goal.",
      detailedAlt:
        "THEN: provide an alternative more direct version with the same meaning.",
      copyOk: "Copied",
      copyFail: "Unable to copy. Please select and copy manually.",
    },
  };

  const maps = {
    it: {
      role: {
        freelance: "Freelance",
        employee: "Dipendente",
        manager: "Manager",
        founder: "Founder",
        other: "Altro",
      },
      recipient: {
        client: "Cliente",
        recruiter: "Recruiter",
        colleague: "Collega",
        manager: "Manager",
        lead: "Lead",
        other: "Altro",
      },
      goal: {
        book_call: "Fissare una call",
        follow_up: "Follow up",
        send_quote: "Inviare un preventivo",
        answer_complaint: "Rispondere a un reclamo",
        request_info: "Richiedere info",
        other: "Altro",
      },
      tone: {
        professional: "Professionale",
        friendly: "Amichevole",
        direct: "Diretto",
        persuasive: "Persuasivo",
        neutral: "Neutro",
      },
      length: { short: "Corta", medium: "Media", long: "Lunga" },
    },
    en: {
      role: {
        freelance: "Freelancer",
        employee: "Employee",
        manager: "Manager",
        founder: "Founder",
        other: "Other",
      },
      recipient: {
        client: "Client",
        recruiter: "Recruiter",
        colleague: "Colleague",
        manager: "Manager",
        lead: "Lead",
        other: "Other",
      },
      goal: {
        book_call: "Book a call",
        follow_up: "Follow up",
        send_quote: "Send a quote",
        answer_complaint: "Answer a complaint",
        request_info: "Request information",
        other: "Other",
      },
      tone: {
        professional: "Professional",
        friendly: "Friendly",
        direct: "Direct",
        persuasive: "Persuasive",
        neutral: "Neutral",
      },
      length: { short: "Short", medium: "Medium", long: "Long" },
    },
  };

  function listFromTextarea(text) {
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  function joinList(items, lang) {
    if (!items.length) return copy[lang].none;
    return items.join("; ");
  }

  function buildPrompt() {
    const lang = els.lang.value;
    const t = copy[lang];
    const m = maps[lang];

    const mustInclude = joinList(listFromTextarea(els.mustInclude.value), lang);
    const mustAvoid = joinList(listFromTextarea(els.mustAvoid.value), lang);

    const topic = els.topic.value.trim() || t.topicPlaceholder;
    const extraInfo = els.extraInfo.value.trim() || t.none;

    const goalKey = els.goal.value;
    const lengthKey = els.length.value;

    const blocks = [];

    blocks.push(t.roleBlock);
    blocks.push("");

    blocks.push(t.contextHeader);
    blocks.push(`${t.language}: ${lang.toUpperCase()}`);
    blocks.push(`${t.sender}: ${m.role[els.role.value]}`);
    blocks.push(`${t.recipient}: ${m.recipient[els.recipient.value]}`);
    blocks.push(`${t.goal}: ${m.goal[goalKey]}`);
    blocks.push("");

    blocks.push(t.inputHeader);
    blocks.push(`${t.topic}: ${topic}`);
    blocks.push(`${t.mustInclude}: ${mustInclude}`);
    blocks.push(`${t.extraInfo}: ${extraInfo}`);
    blocks.push(`${t.mustAvoid}: ${mustAvoid}`);
    blocks.push("");

    blocks.push(t.styleHeader);
    blocks.push(`${t.tone}: ${m.tone[els.tone.value]}`);
    blocks.push(`${t.length}: ${m.length[lengthKey]}`);
    blocks.push("");

    blocks.push(t.rulesHeader);
    blocks.push(t.noInvent);
    blocks.push(`${lang === "it" ? "Obiettivo specifico:" : "Specific goal:"} ${t.goalRule[goalKey]}`);
    blocks.push(t.lengthRule[lengthKey]);
    blocks.push(els.cta.checked ? t.ctaOn : t.ctaOff);
    blocks.push(els.clarify.checked ? t.clarifyOn : t.clarifyOff);
    blocks.push("");

    blocks.push(t.outputHeader);
    blocks.push(t.outputFormat.replace("{name}", els.name.value.trim() || (lang === "it" ? "Nome Cognome" : "First Last")));

    if (variant === "short") {
      blocks.push("");
      blocks.push(t.variantShort);
    }

    if (variant === "detailed") {
      blocks.push("");
      blocks.push(t.variantDetailed);
      blocks.push(t.detailedExplain);
      blocks.push(t.detailedAlt);
    }

    return blocks.join("\n");
  }

  function render() {
    const lang = els.lang.value;
    document.documentElement.lang = lang;
    els.output.textContent = buildPrompt();
    els.copied.textContent = "";
    els.copy.textContent = lang === "it" ? "Copia prompt" : "Copy prompt";
  }

  function setVariant(v) {
    variant = v;
    document.querySelectorAll(".pill").forEach((b) => b.classList.remove("active"));
    document.querySelector(`.pill[data-variant="${v}"]`).classList.add("active");
    render();
  }

  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  document.querySelectorAll(".pill").forEach((btn) => {
    btn.addEventListener("click", () => setVariant(btn.getAttribute("data-variant")));
  });

  els.copy.addEventListener("click", async () => {
    const lang = els.lang.value;
    try {
      await navigator.clipboard.writeText(els.output.textContent || "");
      els.copied.textContent = copy[lang].copyOk;
      setTimeout(() => (els.copied.textContent = ""), 1200);
    } catch {
      alert(copy[lang].copyFail);
    }
  });

  render();
})();
