(function () {
  const $ = (id) => document.getElementById(id);

  function must(id) {
    const el = $(id);
    return el || null;
  }

  const els = {
    lang: must("lang"),
    goal: must("goal"),
    context: must("context"),
    mustInclude: must("mustInclude"),
    mustAvoid: must("mustAvoid"),
    format: must("format"),
    detail: must("detail"),
    audience: must("audience"),
    output: must("output"),
    outputTitle: must("outputTitle"),
    copy: must("copy"),
    copied: must("copied"),
    tabPrompt: must("tabPrompt"),
    tabCheck: must("tabCheck"),
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
        "Sei un assistente esperto e pragmatico. Il tuo compito è aiutarmi a ottenere un risultato concreto e utilizzabile.",
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
        "You are an expert, pragmatic assistant. Your task is to help me achieve a concrete, usable outcome.",
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

  function v(el) {
    return el ? String(el.value || "").trim() : "";
  }

  function list(el) {
    const raw = v(el);
    if (!raw) return [];
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  function formatBlock(title, lines) {
    const safe = (lines || []).filter(Boolean);
    return [title, ...safe].join("\n");
  }

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function isVagueRequest(goalText) {
    const g = normalize(goalText);

    if (!g) return true;

    // Heuristics: too short
    if (g.length < 18) return true;

    // Very generic intents
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

    // Exact or near exact generic
    if (genericPhrases.includes(g)) return true;

    // Generic verb without object
    const genericRegex = /^(scrivi|scrivere|crea|creare|prepara|fare|fammi|aiutami)\b$/i;
    if (genericRegex.test(g)) return true;

    // "scrivere" without clear object (very likely vague)
    if (/\bscrivere\b/.test(g) && g.split(" ").length <= 4) return true;

    // "testo" without qualifier
    if (/\btesto\b/.test(g) && g.split(" ").length <= 4) return true;

    return false;
  }

  function classifyIntent(goalText) {
    const g = normalize(goalText);

    // Writing intents
    if (/\b(email|mail)\b/.test(g)) return "email";
    if (/\b(post|instagram|linkedin|facebook|tiktok)\b/.test(g)) return "post";
    if (/\btesto\b/.test(g)) return "text";
    if (/\btraduci|traduzione|translate\b/.test(g)) return "translation";
    if (/\briassumi|riassunto|summary\b/.test(g)) return "summary";
    if (/\bidea|idee|brainstorm\b/.test(g)) return "ideas";

    // Default
    return "generic";
  }

  function buildAutoInterpretation(lang, goalText, formatKey) {
    const isVague = isVagueRequest(goalText);
    const intent = classifyIntent(goalText);
    const fmt = (formatKey || "plain").toLowerCase();

    if (!isVague) {
      // Even if not vague, we can add a light clarification line only when useful
      return lang === "it"
        ? "Se serve, chiedi chiarimenti solo su informazioni strettamente necessarie."
        : "If needed, ask clarifications only for strictly necessary information.";
    }

    if (lang === "it") {
      if (intent === "email" || fmt === "email") {
        return [
          "La richiesta dell’utente è generica.",
          "Interpretala come: aiutare a creare una email pronta da inviare, chiara e professionale.",
          "Se mancano informazioni essenziali (destinatario, obiettivo, contesto), fai prima fino a 3 domande mirate.",
        ].join("\n");
      }

      if (intent === "post" || fmt === "post") {
        return [
          "La richiesta dell’utente è generica.",
          "Interpretala come: aiutare a creare un post social chiaro, coerente e utilizzabile.",
          "Se mancano informazioni essenziali (piattaforma, obiettivo, pubblico), fai prima fino a 3 domande mirate.",
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
          "Se manca il contesto (settore, vincoli, obiettivo), fai prima fino a 3 domande mirate.",
        ].join("\n");
      }

      return [
        "La richiesta dell’utente è generica.",
        "Interpretala come: aiutare a ottenere un risultato pratico e utilizzabile, nel formato richiesto.",
        "Se mancano informazioni essenziali, fai prima fino a 3 domande mirate.",
      ].join("\n");
    }

    // EN
    if (intent === "email" || fmt === "email") {
      return [
        "The user request is generic.",
        "Interpret it as: help create a ready to send email, clear and professional.",
        "If essential information is missing (recipient, goal, context), ask up to 3 targeted questions first.",
      ].join("\n");
    }

    if (intent === "post" || fmt === "post") {
      return [
        "The user request is generic.",
        "Interpret it as: help create a usable social post, clear and consistent.",
        "If essential information is missing (platform, goal, audience), ask up to 3 targeted questions first.",
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
        "If context is missing (industry, constraints, goal), ask up to 3 targeted questions first.",
      ].join("\n");
    }

    return [
      "The user request is generic.",
      "Interpret it as: help achieve a practical, usable outcome in the requested format.",
      "If essential information is missing, ask up to 3 targeted questions first.",
    ].join("\n");
  }

  function buildPrompt(lang) {
    const t = i18n[lang];

    const goal = v(els.goal);
    const context = v(els.context);
    const include = list(els.mustInclude);
    const avoid = list(els.mustAvoid);
    const audience = v(els.audience);

    const formatKey = els.format ? els.format.value : "plain";
    const detailKey = els.detail ? els.detail.value : "normal";

    const userRequest =
      goal ||
      (lang === "it"
        ? "Descrivi cosa vuoi ottenere."
        : "Describe what you want to achieve.");

    const autoInterpretation = buildAutoInterpretation(lang, goal, formatKey);

    const blocks = [];

    blocks.push(
      formatBlock(t.promptHeader, [
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

    blocks.push("");

    blocks.push(
      formatBlock(t.interpretationHeader, [autoInterpretation])
    );

    blocks.push("");

    blocks.push(
      formatBlock(t.userHeader, [
        userRequest,
        audience
          ? lang === "it"
            ? `Destinatario o pubblico: ${audience}.`
            : `Audience or recipient: ${audience}.`
          : "",
        context
          ? lang === "it"
            ? `Contesto e dati che ho già: ${context}`
            : `Context and data I already have: ${context}`
          : lang === "it"
            ? "Contesto e dati che ho già: nessuno."
            : "Context and data I already have: none.",
      ])
    );

    blocks.push("");

    blocks.push(
      formatBlock(t.constraintsHeader, [
        include.length
          ? lang === "it"
            ? `Deve includere: ${include.join("; ")}.`
            : `Must include: ${include.join("; ")}.`
          : lang === "it"
            ? `Deve includere: ${t.none}.`
            : `Must include: ${t.none}.`,
        avoid.length
          ? lang === "it"
            ? `Deve evitare: ${avoid.join("; ")}.`
            : `Must avoid: ${avoid.join("; ")}.`
          : lang === "it"
            ? `Deve evitare: ${t.none}.`
            : `Must avoid: ${t.none}.`,
      ])
    );

    blocks.push("");

    blocks.push(
      formatBlock(t.outputHeader, [
        lang === "it"
          ? `Formato richiesto: ${t.formatMap[formatKey]}.`
          : `Required format: ${t.formatMap[formatKey]}.`,
        formatKey === "other"
          ? lang === "it"
            ? "Se il formato non è chiaro, fammi 1 domanda di chiarimento sul formato prima di rispondere."
            : "If the format is unclear, ask me 1 clarifying question about the format before answering."
          : "",
      ])
    );

    return blocks.join("\n\n");
  }

  function buildCheck(lang) {
    const t = i18n[lang];

    const goal = v(els.goal);
    const context = v(els.context);
    const include = list(els.mustInclude);

    const checks = [];

    checks.push(t.checkTitle);
    checks.push("");

    checks.push(
      `${goal ? t.ok : t.missing}: ${
        lang === "it" ? "Cosa vuoi ottenere" : "What you want to achieve"
      }`
    );

    checks.push(
      `${context ? t.ok : t.missing}: ${
        lang === "it" ? "Contesto o dati" : "Context or data"
      }`
    );

    checks.push(
      `${include.length ? t.ok : t.missing}: ${
        lang === "it" ? "Cosa deve includere" : "Must include"
      }`
    );

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
    if (els.outputTitle)
      els.outputTitle.textContent =
        tab === "prompt" ? t.titlePrompt : t.titleCheck;

    els.output.textContent = tab === "prompt" ? buildPrompt(lang) : buildCheck(lang);

    if (els.copied) els.copied.textContent = "";
    document.documentElement.lang = lang;
  }

  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
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
