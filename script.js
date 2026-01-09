/* script.js */
(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    lang: $("lang"),
    goal: $("goal"),
    context: $("context"),
    mustInclude: $("mustInclude"),
    mustAvoid: $("mustAvoid"),
    format: $("format"),
    detail: $("detail"),
    audience: $("audience"),

    generate: $("generate"),
    status: $("status"),

    output: $("output"),
    copy: $("copy"),
    copied: $("copied"),
  };

  if (!els.output || !els.generate) return;

  const i18n = {
    it: {
      warnTitle: "Attenzione",
      warnBody:
        "Non hai compilato tutti i campi. Questo potrebbe generare un prompt più generico. Vuoi generarlo lo stesso?",
      copied: "Copiato",
      copyFail: "Non riesco a copiare automaticamente. Seleziona e copia manualmente.",
      generated: "Prompt generato",
      nothing: "nessuno",
      formatMap: {
        plain: "Testo semplice",
        steps: "Passi da seguire",
        bullets: "Elenco puntato",
        table: "Tabella",
        email: "Email",
        post: "Post",
        other: "Formato personalizzato",
      },
      detailMap: {
        fast: "Risposta veloce ed essenziale",
        normal: "Risposta completa ma sintetica",
        deep: "Risposta molto dettagliata, con esempi",
      },
    },
    en: {
      warnTitle: "Warning",
      warnBody:
        "You did not fill in all fields. This may generate a more generic prompt. Do you want to generate it anyway?",
      copied: "Copied",
      copyFail: "Unable to copy automatically. Please select and copy manually.",
      generated: "Prompt generated",
      nothing: "none",
      formatMap: {
        plain: "Plain text",
        steps: "Step by step",
        bullets: "Bullet list",
        table: "Table",
        email: "Email",
        post: "Post",
        other: "Custom format",
      },
      detailMap: {
        fast: "Fast and essential",
        normal: "Complete but concise",
        deep: "Very detailed, with examples",
      },
    },
  };

  function v(el) {
    return el ? String(el.value || "").trim() : "";
  }

  function listFromTextarea(el) {
    const raw = v(el);
    if (!raw) return [];
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function isPlaceholderOrEmpty(goalText, lang) {
    const g = normalize(goalText);
    if (!g) return true;

    const placeholdersIt = [
      "descrivi cosa vuoi ottenere.",
      "descrivi cosa vuoi ottenere",
      "scrivi cosa ti serve",
      "spiega cosa ti serve",
    ];
    const placeholdersEn = [
      "describe what you want to achieve.",
      "describe what you want to achieve",
      "write what you need",
      "explain what you need",
    ];
    const placeholders = lang === "it" ? placeholdersIt : placeholdersEn;

    if (placeholders.includes(g)) return true;
    if (g.length < 3) return true;

    return false;
  }

  function isVagueRequest(goalText) {
    const g = normalize(goalText);
    if (!g) return true;
    if (g.length < 18) return true;

    const genericPhrases = [
      "scrivere una mail",
      "scrivere una email",
      "scrivere email",
      "scrivere mail",
      "fammi una mail",
      "fammi una email",
      "fammi un testo",
      "scrivere un testo",
      "creare un testo",
      "aiutami",
      "aiuto",
      "non so",
      "mi serve aiuto",
      "mi serve una cosa",
      "ho un problema",
      "dammi una mano",
      "scrivi",
      "testo",
      "mail",
      "email",
    ];

    if (genericPhrases.includes(g)) return true;

    const genericRegex = /^(scrivi|scrivere|crea|creare|prepara|fare|fammi|aiutami)\b$/i;
    if (genericRegex.test(g)) return true;

    if (/\bscrivere\b/.test(g) && g.split(" ").length <= 4) return true;
    if (/\btesto\b/.test(g) && g.split(" ").length <= 4) return true;

    return false;
  }

  function classifyIntent(goalText) {
    const g = normalize(goalText);

    if (/\b(email|mail)\b/.test(g)) return "email";
    if (/\b(post|instagram|linkedin|facebook|tiktok)\b/.test(g)) return "post";
    if (/\btraduci|traduzione|translate\b/.test(g)) return "translation";
    if (/\briassumi|riassunto|summary\b/.test(g)) return "summary";
    if (/\bidea|idee|brainstorm\b/.test(g)) return "ideas";

    return "generic";
  }

  function buildUserRequest(lang, goalText) {
    const g = (goalText || "").trim();

    if (isPlaceholderOrEmpty(g, lang)) {
      return lang === "it"
        ? "L’utente non è riuscito a spiegare chiaramente cosa vuole ottenere. Ha bisogno di aiuto per chiarire la richiesta e identificare l’obiettivo finale."
        : "The user was not able to clearly explain what they want to achieve. They need help clarifying the request and identifying the final goal.";
    }

    return g;
  }

  function buildAutoInterpretation(lang, goalText, formatKey) {
    const g = (goalText || "").trim();
    const fmt = (formatKey || "plain").toLowerCase();

    if (isPlaceholderOrEmpty(g, lang)) {
      return lang === "it"
        ? [
            "La richiesta dell’utente è assente o troppo poco chiara.",
            "Il primo obiettivo è capire cosa l’utente vuole ottenere con una domanda alla volta, molto semplice.",
            "Poi proponi un risultato utile e migliorabile, coerente con il formato richiesto.",
          ].join("\n")
        : [
            "The user request is missing or too unclear.",
            "Your first goal is to understand what the user wants to achieve, one simple question at a time.",
            "Then provide a useful, improvable result in the requested format.",
          ].join("\n");
    }

    const vague = isVagueRequest(goalText);
    const intent = classifyIntent(goalText);

    if (!vague) {
      return lang === "it"
        ? "Se serve, chiedi chiarimenti solo su informazioni strettamente necessarie."
        : "If needed, ask clarifications only for strictly necessary information.";
    }

    if (lang === "it") {
      if (intent === "email" || fmt === "email") {
        return [
          "La richiesta dell’utente è generica.",
          "Interpretala come: aiutare a creare una email pronta da inviare, chiara e professionale.",
          "Se mancano informazioni essenziali come destinatario, obiettivo e contesto, fai prima fino a 3 domande mirate.",
        ].join("\n");
      }

      if (intent === "post" || fmt === "post") {
        return [
          "La richiesta dell’utente è generica.",
          "Interpretala come: aiutare a creare un post chiaro e utilizzabile.",
          "Se mancano informazioni essenziali come piattaforma, obiettivo e pubblico, fai prima fino a 3 domande mirate.",
        ].join("\n");
      }

      if (intent === "translation") {
        return [
          "La richiesta dell’utente è generica.",
          "Interpretala come: tradurre un testo mantenendo senso e tono, senza inventare contenuti.",
          "Se mancano lingua di partenza o di arrivo, fai prima fino a 3 domande mirate.",
        ].join("\n");
      }

      if (intent === "summary") {
        return [
          "La richiesta dell’utente è generica.",
          "Interpretala come: creare un riassunto chiaro, fedele e utile.",
          "Se manca il testo da riassumere o lo scopo, fai prima fino a 3 domande mirate.",
        ].join("\n");
      }

      if (intent === "ideas") {
        return [
          "La richiesta dell’utente è generica.",
          "Interpretala come: generare idee pratiche con criteri e prossimi passi.",
          "Se manca contesto come settore, vincoli e obiettivo, fai prima fino a 3 domande mirate.",
        ].join("\n");
      }

      return [
        "La richiesta dell’utente è generica.",
        "Interpretala come: aiutare a ottenere un risultato pratico e utilizzabile, nel formato richiesto.",
        "Se mancano informazioni essenziali, fai prima fino a 3 domande mirate.",
      ].join("\n");
    }

    if (intent === "email" || fmt === "email") {
      return [
        "The user request is generic.",
        "Interpret it as: help create a ready to send email, clear and professional.",
        "If essential information is missing such as recipient, goal, and context, ask up to 3 targeted questions first.",
      ].join("\n");
    }

    if (intent === "post" || fmt === "post") {
      return [
        "The user request is generic.",
        "Interpret it as: help create a usable post, clear and consistent.",
        "If essential information is missing such as platform, goal, and audience, ask up to 3 targeted questions first.",
      ].join("\n");
    }

    if (intent === "translation") {
      return [
        "The user request is generic.",
        "Interpret it as: translate while preserving meaning and tone, without inventing content.",
        "If source or target language is missing, ask up to 3 targeted questions first.",
      ].join("\n");
    }

    if (intent === "summary") {
      return [
        "The user request is generic.",
        "Interpret it as: create a clear, faithful, useful summary.",
        "If the text or the purpose is missing, ask up to 3 targeted questions first.",
      ].join("\n");
    }

    if (intent === "ideas") {
      return [
        "The user request is generic.",
        "Interpret it as: generate practical ideas with criteria and next steps.",
        "If context is missing such as industry, constraints, and goal, ask up to 3 targeted questions first.",
      ].join("\n");
    }

    return [
      "The user request is generic.",
      "Interpret it as: help achieve a practical, usable outcome in the requested format.",
      "If essential information is missing, ask up to 3 targeted questions first.",
    ].join("\n");
  }

  function block(title, lines) {
    const safe = (lines || []).filter(Boolean);
    return [title, ...safe].join("\n");
  }

  function buildOutputBlock(lang, t, formatKey, emptyRequest) {
    if (!emptyRequest) {
      const lines = [
        lang === "it"
          ? `Formato richiesto: ${t.formatMap[formatKey]}.`
          : `Required format: ${t.formatMap[formatKey]}.`,
      ];

      if (formatKey === "other") {
        lines.push(
          lang === "it"
            ? "Se il formato non è chiaro, fai 1 domanda di chiarimento sul formato prima di rispondere."
            : "If the format is unclear, ask 1 clarifying question about the format before answering."
        );
      }

      return block(lang === "it" ? "FORMATO OUTPUT" : "OUTPUT FORMAT", lines);
    }

    const lines = [
      lang === "it"
        ? "La richiesta è troppo poco chiara. Segui questo ordine:"
        : "The request is too unclear. Follow this order:",
      lang === "it"
        ? "1 Fai 3 domande semplici con opzioni A B C"
        : "1 Ask 3 simple questions with A B C options",
      lang === "it"
        ? "2 Proponi 3 interpretazioni possibili di cosa l’utente potrebbe volere"
        : "2 Propose 3 possible interpretations of what the user might want",
      lang === "it"
        ? "3 Fornisci una bozza generica ma utile con segnaposto e assunzioni dichiarate"
        : "3 Provide a generic but useful draft with placeholders and clearly stated assumptions",
    ];

    return block(lang === "it" ? "FORMATO OUTPUT" : "OUTPUT FORMAT", lines);
  }

  function buildPrompt(lang) {
    const t = i18n[lang];

    const goalRaw = v(els.goal);
    const context = v(els.context);
    const include = listFromTextarea(els.mustInclude);
    const avoid = listFromTextarea(els.mustAvoid);
    const audience = v(els.audience);

    const formatKey = els.format ? els.format.value : "plain";
    const detailKey = els.detail ? els.detail.value : "normal";

    const emptyRequest = isPlaceholderOrEmpty(goalRaw, lang);

    const userRequest = buildUserRequest(lang, goalRaw);
    const autoInterpretation = buildAutoInterpretation(lang, goalRaw, formatKey);

    const instructionsTitle = lang === "it" ? "ISTRUZIONI PER L’AI" : "INSTRUCTIONS FOR THE AI";
    const interpretationTitle = lang === "it" ? "INTERPRETAZIONE AUTOMATICA" : "AUTO INTERPRETATION";
    const requestTitle = lang === "it" ? "RICHIESTA UTENTE" : "USER REQUEST";
    const constraintsTitle = lang === "it" ? "VINCOLI" : "CONSTRAINTS";

    const instructionsLines =
      lang === "it"
        ? [
            "Sei un assistente esperto e pragmatico. Il tuo compito è aiutare l’utente a ottenere un risultato concreto e utilizzabile.",
            "Non inventare dati, nomi, numeri o promesse. Se qualcosa non è noto, dichiaralo esplicitamente oppure usa segnaposto chiari tra parentesi quadre.",
            "Se la richiesta è vaga o incompleta, fai prima fino a 3 domande mirate e semplici. Dopo le risposte, fornisci la risposta finale completa.",
            "Se l’utente non risponde alle domande, produci comunque una bozza utile con segnaposto e assunzioni dichiarate in modo trasparente.",
            "Quando fai domande, preferisci opzioni a scelta A B C o domande chiuse. Usa frasi semplici.",
            `Livello di dettaglio: ${t.detailMap[detailKey]}.`,
          ]
        : [
            "You are an expert, pragmatic assistant. Your task is to help the user achieve a concrete, usable outcome.",
            "Do not invent data, names, numbers, or promises. If something is unknown, say so clearly or use clear placeholders in square brackets.",
            "If the request is vague or incomplete, ask up to 3 targeted, simple questions first. After the answers, provide the complete final result.",
            "If the user does not answer the questions, still produce a useful draft with placeholders and clearly stated assumptions.",
            "When asking questions, prefer multiple choice A B C or closed questions. Use simple language.",
            `Detail level: ${t.detailMap[detailKey]}.`,
          ];

    const contextLine = context
      ? lang === "it"
        ? `Contesto e dati che l’utente ha già: ${context}`
        : `Context and data the user already has: ${context}`
      : lang === "it"
        ? "Contesto e dati che l’utente ha già: nessuno."
        : "Context and data the user already has: none.";

    const audienceLine = audience
      ? lang === "it"
        ? `Destinatario o pubblico: ${audience}.`
        : `Audience or recipient: ${audience}.`
      : "";

    const includeLine = include.length
      ? lang === "it"
        ? `Deve includere: ${include.join("; ")}.`
        : `Must include: ${include.join("; ")}.`
      : lang === "it"
        ? `Deve includere: ${t.nothing}.`
        : `Must include: ${t.nothing}.`;

    const avoidLine = avoid.length
      ? lang === "it"
        ? `Deve evitare: ${avoid.join("; ")}.`
        : `Must avoid: ${avoid.join("; ")}.`
      : lang === "it"
        ? `Deve evitare: ${t.nothing}.`
        : `Must avoid: ${t.nothing}.`;

    const parts = [];
    parts.push(block(instructionsTitle, instructionsLines));
    parts.push("");
    parts.push(block(interpretationTitle, [autoInterpretation]));
    parts.push("");
    parts.push(block(requestTitle, [userRequest, audienceLine, contextLine].filter(Boolean)));
    parts.push("");
    parts.push(block(constraintsTitle, [includeLine, avoidLine]));
    parts.push("");
    parts.push(buildOutputBlock(lang, t, formatKey, emptyRequest));

    return parts.join("\n\n");
  }

  function missingFields() {
    const missing = [];
    if (!v(els.goal)) missing.push("goal");
    if (!v(els.context)) missing.push("context");
    if (!v(els.mustInclude)) missing.push("mustInclude");
    if (!v(els.mustAvoid)) missing.push("mustAvoid");
    if (!v(els.audience)) missing.push("audience");
    return missing;
  }

  function clearStatus() {
    if (els.status) els.status.textContent = "";
    if (els.copied) els.copied.textContent = "";
  }

  function setGeneratedState(on) {
    els.copy.disabled = !on;
  }

  function generate() {
    clearStatus();

    const lang = els.lang ? els.lang.value : "it";
    const t = i18n[lang];

    const missing = missingFields();
    if (missing.length > 0) {
      const ok = window.confirm(t.warnBody);
      if (!ok) return;
    }

    const prompt = buildPrompt(lang);
    els.output.textContent = prompt;
    setGeneratedState(true);

    if (els.status) {
      els.status.textContent = t.generated;
      setTimeout(() => {
        if (els.status) els.status.textContent = "";
      }, 1200);
    }
  }

  async function copyOutput() {
    clearStatus();

    const lang = els.lang ? els.lang.value : "it";
    const t = i18n[lang];

    try {
      await navigator.clipboard.writeText(els.output.textContent || "");
      if (els.copied) els.copied.textContent = t.copied;
      setTimeout(() => {
        if (els.copied) els.copied.textContent = "";
      }, 1200);
    } catch {
      alert(t.copyFail);
    }
  }

  els.generate.addEventListener("click", generate);
  els.copy.addEventListener("click", copyOutput);

  if (els.lang) {
    els.lang.addEventListener("change", () => {
      clearStatus();
      document.documentElement.lang = els.lang.value || "it";
    });
  }

  setGeneratedState(false);
  document.documentElement.lang = els.lang ? els.lang.value : "it";
})();
