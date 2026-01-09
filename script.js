(function () {
  const $ = (id) => document.getElementById(id);

  function el(id) {
    return $(id) || null;
  }

  const els = {
    lang: el("lang"),
    goal: el("goal"),
    context: el("context"),
    mustInclude: el("mustInclude"),
    mustAvoid: el("mustAvoid"),
    format: el("format"),
    detail: el("detail"),
    audience: el("audience"),

    output: el("output"),
    outputTitle: el("outputTitle"),
    copy: el("copy"),
    copied: el("copied"),

    tabPrompt: el("tabPrompt"),
    tabCheck: el("tabCheck"),
  };

  if (!els.output) return;

  let tab = "prompt";

  const i18n = {
    it: {
      titlePrompt: "Da incollare su AI",
      titleCheck: "Check rapido",
      copy: "Copia",
      copied: "Copiato",
      copyFail: "Non riesco a copiare automaticamente. Seleziona e copia manualmente.",
      none: "Nessuno",
      missing: "Manca",
      ok: "Ok",

      promptHeader: "ISTRUZIONI PER L’AI",
      interpretationHeader: "INTERPRETAZIONE AUTOMATICA",
      userHeader: "RICHIESTA UTENTE",
      constraintsHeader: "VINCOLI",
      outputHeader: "FORMATO OUTPUT",

      baseRole:
        "Sei un assistente esperto e pragmatico. Il tuo compito è aiutare l’utente a ottenere un risultato concreto e utilizzabile.",
      noInvent:
        "Non inventare dati, nomi, numeri o promesse. Se qualcosa non è noto, dichiaralo esplicitamente oppure usa segnaposto chiari tra parentesi quadre.",
      askThenAnswer:
        "Se la richiesta è vaga o incompleta, fai prima fino a 3 domande mirate e semplici. Dopo le risposte, fornisci la risposta finale completa.",
      stillProvideDraft:
        "Se l’utente non risponde alle domande, produci comunque una bozza utile con segnaposto e assunzioni dichiarate in modo trasparente.",

      detailMap: {
        fast: "Risposta veloce ed essenziale",
        normal: "Risposta completa ma sintetica",
        deep: "Risposta molto dettagliata, con esempi",
      },

      formatMap: {
        plain: "Testo semplice",
        steps: "Passi da seguire",
        bullets: "Elenco puntato",
        table: "Tabella",
        email: "Email",
        post: "Post",
        other: "Formato personalizzato",
      },

      checkTitle: "Check rapido prima di incollare su AI",
      checkTip:
        "Suggerimento: per ottenere un risultato migliore, aggiungi un esempio o un testo di partenza nel campo “Che cosa hai già”. Anche 3 righe aiutano molto.",
    },

    en: {
      titlePrompt: "To paste into AI",
      titleCheck: "Quick check",
      copy: "Copy",
      copied: "Copied",
      copyFail: "Unable to copy automatically. Please select and copy manually.",
      none: "None",
      missing: "Missing",
      ok: "Ok",

      promptHeader: "INSTRUCTIONS FOR THE AI",
      interpretationHeader: "AUTO INTERPRETATION",
      userHeader: "USER REQUEST",
      constraintsHeader: "CONSTRAINTS",
      outputHeader: "OUTPUT FORMAT",

      baseRole:
        "You are an expert, pragmatic assistant. Your task is to help the user achieve a concrete, usable outcome.",
      noInvent:
        "Do not invent data, names, numbers, or promises. If something is unknown, say so clearly or use clear placeholders in square brackets.",
      askThenAnswer:
        "If the request is vague or incomplete, ask up to 3 targeted, simple questions first. After the answers, provide the complete final result.",
      stillProvideDraft:
        "If the user does not answer the questions, still produce a useful draft with placeholders and clearly stated assumptions.",

      detailMap: {
        fast: "Fast and essential",
        normal: "Complete but concise",
        deep: "Very detailed, with examples",
      },

      formatMap: {
        plain: "Plain text",
        steps: "Step by step",
        bullets: "Bullet list",
        table: "Table",
        email: "Email",
        post: "Post",
        other: "Custom format",
      },

      checkTitle: "Quick check before pasting into AI",
      checkTip:
        "Tip: for better results, add an example or a starting text into “What you already have”. Even 3 lines help a lot.",
    },
  };

  function val(e) {
    return e ? String(e.value || "").trim() : "";
  }

  function listFromTextarea(e) {
    const raw = val(e);
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

    const placeholdersIt = ["descrivi cosa vuoi ottenere.", "descrivi cosa vuoi ottenere", "scrivi cosa ti serve", "scrivi cosa vuoi"];
    const placeholdersEn = ["describe what you want to achieve.", "describe what you want to achieve", "write what you need"];

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
    if (/\btesto\b/.test(g)) return "text";
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
          "Interpretala come: aiutare a creare un post social chiaro, coerente e utilizzabile.",
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
          "Se manca il testo da riassumere o lo scopo del riassunto, fai prima fino a 3 domande mirate.",
        ].join("\n");
      }

      if (intent === "ideas") {
        return [
          "La richiesta dell’utente è generica.",
          "Interpretala come: generare idee pratiche e utilizzabili, con criteri e prossimi passi.",
          "Se manca il contesto come settore, vincoli e obiettivo, fai prima fino a 3 domande mirate.",
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
        "Interpret it as: help create a usable social post, clear and consistent.",
        "If essential information is missing such as platform, goal, and audience, ask up to 3 targeted questions first.",
      ].join("\n");
    }

    if (intent === "translation") {
      return [
        "The user request is generic.",
        "Interpret it as: translate text while preserving meaning and tone, without inventing content.",
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

  function buildPrompt(lang) {
    const t = i18n[lang];

    const goalRaw = val(els.goal);
    const context = val(els.context);
    const include = listFromTextarea(els.mustInclude);
    const avoid = listFromTextarea(els.mustAvoid);
    const audience = val(els.audience);

    const formatKey = els.format ? els.format.value : "plain";
    const detailKey = els.detail ? els.detail.value : "normal";

    const userRequest = buildUserRequest(lang, goalRaw);
    const autoInterpretation = buildAutoInterpretation(lang, goalRaw, formatKey);

    const parts = [];

    parts.push(
      block(t.promptHeader, [
        t.baseRole,
        t.noInvent,
        t.askThenAnswer,
        t.stillProvideDraft,
        "",
        lang === "it"
          ? `Livello di dettaglio: ${t.detailMap[detailKey]}.`
          : `Detail level: ${t.detailMap[detailKey]}.`,
      ])
    );

    parts.push("");
    parts.push(block(t.interpretationHeader, [autoInterpretation]));
    parts.push("");

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

    parts.push(
      block(t.userHeader, [
        userRequest,
        audienceLine,
        contextLine,
      ])
    );

    parts.push("");

    const includeLine = include.length
      ? lang === "it"
        ? `Deve includere: ${include.join("; ")}.`
        : `Must include: ${include.join("; ")}.`
      : lang === "it"
        ? `Deve includere: ${t.none}.`
        : `Must include: ${t.none}.`;

    const avoidLine = avoid.length
      ? lang === "it"
        ? `Deve evitare: ${avoid.join("; ")}.`
        : `Must avoid: ${avoid.join("; ")}.`
      : lang === "it"
        ? `Deve evitare: ${t.none}.`
        : `Must avoid: ${t.none}.`;

    parts.push(block(t.constraintsHeader, [includeLine, avoidLine]));
    parts.push("");

    const formatLines = [
      lang === "it"
        ? `Formato richiesto: ${t.formatMap[formatKey]}.`
        : `Required format: ${t.formatMap[formatKey]}.`,
    ];

    if (formatKey === "other") {
      formatLines.push(
        lang === "it"
          ? "Se il formato non è chiaro, fai 1 domanda di chiarimento sul formato prima di rispondere."
          : "If the format is unclear, ask 1 clarifying question about the format before answering."
      );
    }

    parts.push(block(t.outputHeader, formatLines));

    return parts.join("\n\n");
  }

  function buildCheck(lang) {
    const t = i18n[lang];

    const goalRaw = val(els.goal);
    const context = val(els.context);
    const include = listFromTextarea(els.mustInclude);

    const checks = [];
    checks.push(t.checkTitle);
    checks.push("");

    const goalOk = !isPlaceholderOrEmpty(goalRaw, lang);
    checks.push(`${goalOk ? t.ok : t.missing}: ${lang === "it" ? "Cosa vuoi ottenere" : "What you want to achieve"}`);
    checks.push(`${context ? t.ok : t.missing}: ${lang === "it" ? "Contesto o dati" : "Context or data"}`);
    checks.push(`${include.length ? t.ok : t.missing}: ${lang === "it" ? "Cosa deve includere" : "Must include"}`);

    checks.push("");
    checks.push(t.checkTip);

    return checks.join("\n");
  }

  function setTab(next) {
    tab = next;

    if (els.tabPrompt) els.tabPrompt.classList.toggle("active", tab === "prompt");
    if (els.tabCheck) els.tabCheck.classList.toggle("active", tab === "check");

    render();
  }

  function render() {
    const lang = els.lang ? els.lang.value : "it";
    const t = i18n[lang];

    if (els.copy) els.copy.textContent = t.copy;
    if (els.outputTitle) els.outputTitle.textContent = tab === "prompt" ? t.titlePrompt : t.titleCheck;

    els.output.textContent = tab === "prompt" ? buildPrompt(lang) : buildCheck(lang);

    if (els.copied) els.copied.textContent = "";
    document.documentElement.lang = lang;
  }

  document.querySelectorAll("input, select, textarea").forEach((node) => {
    node.addEventListener("input", render);
    node.addEventListener("change", render);
  });

  if (els.tabPrompt) els.tabPrompt.addEventListener("click", () => setTab("prompt"));
  if (els.tabCheck) els.tabCheck.addEventListener("click", () => setTab("check"));

  if (els.copy) {
    els.copy.addEventListener("click", async () => {
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
    });
  }

  setTab("prompt");
})();
