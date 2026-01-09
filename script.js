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

  /* =========================
     COPY PER UTENTE NON TECNICO
     ========================= */

  const copy = {
    it: {
      titleReady: "TESTO PRONTO",
      titlePrompt: "VERSIONE DA INCOLLARE SU CHATGPT",

      introReady:
        "Usa questo testo così com’è. Puoi copiarlo e inviarlo direttamente.",
      introPrompt:
        "Se preferisci usare ChatGPT o un’altra AI, copia questo testo e incollalo lì.",

      assistantRole:
        "Sei un assistente esperto di scrittura professionale. Aiuta a scrivere email chiare, educate e orientate al risultato.",

      noInvent:
        "Non inventare dati, numeri o promesse. Se qualcosa non è chiaro, gestisci l’incertezza in modo esplicito.",

      clarifyOn:
        "Se mancano informazioni importanti, fai prima poche domande di chiarimento, poi scrivi il testo completo.",
      clarifyOff:
        "Se mancano informazioni, usa segnaposto chiari come [nome], [data], [link].",

      ctaOn:
        "Concludi con una richiesta chiara su cosa deve fare il destinatario.",
      ctaOff:
        "Chiudi il messaggio in modo neutro, senza richieste esplicite.",

      outputFormat:
        "Scrivi un’email completa con:\n- oggetto\n- saluto\n- corpo chiaro\n- chiusura\n- firma",

      variantShort:
        "Scrivi una versione molto breve e diretta.",
      variantDetailed:
        "Dopo l’email, aggiungi una breve spiegazione del perché il testo funziona.",

      copied: "Copiato",
      copyFail:
        "Non riesco a copiare automaticamente. Seleziona il testo e copialo manualmente.",
    },

    en: {
      titleReady: "READY TO USE TEXT",
      titlePrompt: "VERSION TO PASTE INTO CHATGPT",

      introReady:
        "You can use this text as it is. Just copy and send it.",
      introPrompt:
        "If you prefer using ChatGPT or another AI, copy and paste this text there.",

      assistantRole:
        "You are an expert in professional writing. Help write clear, polite and goal oriented emails.",

      noInvent:
        "Do not invent data, numbers or promises. Handle missing information explicitly.",

      clarifyOn:
        "If important information is missing, ask a few clarifying questions first, then write the full text.",
      clarifyOff:
        "If information is missing, use clear placeholders such as [name], [date], [link].",

      ctaOn:
        "End with a clear request telling the recipient what to do next.",
      ctaOff:
        "Close the message neutrally, without explicit requests.",

      outputFormat:
        "Write a complete email including:\n- subject\n- greeting\n- clear body\n- closing\n- signature",

      variantShort:
        "Write a very short and direct version.",
      variantDetailed:
        "After the email, add a short explanation of why this text works.",

      copied: "Copied",
      copyFail:
        "Unable to copy automatically. Please select and copy manually.",
    },
  };

  const maps = {
    it: {
      role: {
        freelance: "Freelance",
        employee: "Dipendente",
        manager: "Manager",
        founder: "Imprenditore",
        other: "Professionista",
      },
      recipient: {
        client: "Cliente",
        recruiter: "Recruiter",
        colleague: "Collega",
        manager: "Responsabile",
        lead: "Potenziale cliente",
        other: "Destinatario",
      },
      goal: {
        book_call: "fissare una call",
        follow_up: "fare un follow up",
        send_quote: "inviare un preventivo",
        answer_complaint: "rispondere a un reclamo",
        request_info: "richiedere informazioni",
        other: "comunicare in modo chiaro",
      },
      tone: {
        professional: "professionale",
        friendly: "amichevole",
        direct: "diretto",
        persuasive: "convincente",
        neutral: "neutro",
      },
      length: {
        short: "breve",
        medium: "di media lunghezza",
        long: "più dettagliato",
      },
    },
    en: {
      role: {
        freelance: "Freelancer",
        employee: "Employee",
        manager: "Manager",
        founder: "Business owner",
        other: "Professional",
      },
      recipient: {
        client: "Client",
        recruiter: "Recruiter",
        colleague: "Colleague",
        manager: "Manager",
        lead: "Potential client",
        other: "Recipient",
      },
      goal: {
        book_call: "book a call",
        follow_up: "send a follow up",
        send_quote: "send a quote",
        answer_complaint: "answer a complaint",
        request_info: "request information",
        other: "communicate clearly",
      },
      tone: {
        professional: "professional",
        friendly: "friendly",
        direct: "direct",
        persuasive: "persuasive",
        neutral: "neutral",
      },
      length: {
        short: "short",
        medium: "medium length",
        long: "more detailed",
      },
    },
  };

  function list(text) {
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  function buildPrompt() {
    const lang = els.lang.value;
    const t = copy[lang];
    const m = maps[lang];

    const blocks = [];

    blocks.push(t.assistantRole);
    blocks.push("");

    blocks.push(
      `Scrivi un’email ${m.length[els.length.value]} con tono ${m.tone[els.tone.value]} per un ${m.recipient[els.recipient.value]}.`
    );
    blocks.push(
      `L’obiettivo è ${m.goal[els.goal.value]}.`
    );
    blocks.push("");

    blocks.push(`Argomento: ${els.topic.value || "—"}`);

    const include = list(els.mustInclude.value);
    if (include.length) {
      blocks.push(`Includi: ${include.join(", ")}`);
    }

    const avoid = list(els.mustAvoid.value);
    if (avoid.length) {
      blocks.push(`Evita: ${avoid.join(", ")}`);
    }

    if (els.extraInfo.value.trim()) {
      blocks.push(`Informazioni utili: ${els.extraInfo.value.trim()}`);
    }

    blocks.push("");
    blocks.push(t.noInvent);
    blocks.push(els.cta.checked ? t.ctaOn : t.ctaOff);
    blocks.push(els.clarify.checked ? t.clarifyOn : t.clarifyOff);
    blocks.push("");
    blocks.push(t.outputFormat.replace("{name}", els.name.value || ""));

    if (variant === "short") {
      blocks.push("");
      blocks.push(t.variantShort);
    }

    if (variant === "detailed") {
      blocks.push("");
      blocks.push(t.variantDetailed);
    }

    return blocks.join("\n");
  }

  function render() {
    els.output.textContent = buildPrompt();
    els.copied.textContent = "";
  }

  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  document.querySelectorAll(".pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".pill")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      variant = btn.dataset.variant;
      render();
    });
  });

  els.copy.addEventListener("click", async () => {
    const lang = els.lang.value;
    try {
      await navigator.clipboard.writeText(els.output.textContent || "");
      els.copied.textContent = copy[lang].copied;
      setTimeout(() => (els.copied.textContent = ""), 1200);
    } catch {
      alert(copy[lang].copyFail);
    }
  });

  render();
})();
