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

  if (!els.output) {
    // Se non troviamo nemmeno l'output, non possiamo renderizzare nulla.
    // Questo succede quasi sempre quando index.html non è quello aggiornato.
    return;
  }

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
      userHeader: "RICHIESTA UTENTE",
      constraintsHeader: "VINCOLI",
      outputHeader: "FORMATO OUTPUT",
      clarifyRule:
        "Se qualcosa non è chiaro o mancano informazioni importanti, fai prima fino a 3 domande mirate. Poi fornisci la risposta finale.",
      noInvent: "Non inventare dati o dettagli. Se non hai informazioni, dillo chiaramente.",
      formatMap: {
        plain: "Testo semplice",
        steps: "Passi da seguire",
        bullets: "Elenco puntato",
        table: "Tabella",
        email: "Email pronta",
        post: "Post social",
        other: "Formato personalizzato",
      },
      detailMap: {
        fast: "Risposta veloce, essenziale",
        normal: "Risposta completa ma sintetica",
        deep: "Risposta molto dettagliata, con esempi",
      },
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
      userHeader: "USER REQUEST",
      constraintsHeader: "CONSTRAINTS",
      outputHeader: "OUTPUT FORMAT",
      clarifyRule:
        "If something is unclear or important information is missing, ask up to 3 targeted questions first. Then provide the final answer.",
      noInvent: "Do not invent data or details. If you do not know, say so clearly.",
      formatMap: {
        plain: "Plain text",
        steps: "Step by step",
        bullets: "Bullet list",
        table: "Table",
        email: "Ready email",
        post: "Social post",
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
    return el ? (el.value || "").trim() : "";
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
    return [title, ...lines.filter(Boolean)].join("\n");
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

    const userRequest = goal || (lang === "it" ? "Descrivi cosa vuoi ottenere." : "Describe what you want to achieve.");

    const blocks = [];

    blocks.push(
      formatBlock(t.promptHeader, [
        lang === "it"
          ? "Sei un assistente esperto e pragmatico. Il tuo compito è aiutarmi a ottenere un risultato concreto."
          : "You are an expert, pragmatic assistant. Your task is to help me achieve a concrete outcome.",
        t.noInvent,
        t.clarifyRule,
        "",
        lang === "it" ? `Livello di dettaglio: ${t.detailMap[detailKey]}.` : `Detail level: ${t.detailMap[detailKey]}.`,
      ])
    );

    blocks.push("");

    blocks.push(
      formatBlock(t.userHeader, [
        userRequest,
        audience ? (lang === "it" ? `Destinatario: ${audience}.` : `Intended audience: ${audience}.`) : "",
        context ? (lang === "it" ? `Contesto e dati che ho già: ${context}` : `Context and data I already have: ${context}`) : "",
      ])
    );

    blocks.push("");

    blocks.push(
      formatBlock(t.constraintsHeader, [
        include.length
          ? (lang === "it" ? `Deve includere: ${include.join("; ")}.` : `Must include: ${include.join("; ")}.`)
          : (lang === "it" ? `Deve includere: ${t.none}.` : `Must include: ${t.none}.`),
        avoid.length
          ? (lang === "it" ? `Deve evitare: ${avoid.join("; ")}.` : `Must avoid: ${avoid.join("; ")}.`)
          : (lang === "it" ? `Deve evitare: ${t.none}.` : `Must avoid: ${t.none}.`),
      ])
    );

    blocks.push("");

    blocks.push(
      formatBlock(t.outputHeader, [
        lang === "it" ? `Formato richiesto: ${t.formatMap[formatKey]}.` : `Required format: ${t.formatMap[formatKey]}.`,
        formatKey === "other"
          ? lang === "it"
            ? "Se il formato non è chiaro, fammi 1 domanda di chiarimento."
            : "If the format is unclear, ask me 1 clarifying question."
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
    checks.push(lang === "it" ? "Check rapido prima di incollare su AI" : "Quick check before pasting into AI");
    checks.push("");
    checks.push(`${goal ? t.ok : t.missing}: ${lang === "it" ? "Cosa vuoi ottenere" : "What you want to achieve"}`);
    checks.push(`${context ? t.ok : t.missing}: ${lang === "it" ? "Contesto o dati che hai già" : "Context or data you already have"}`);
    checks.push(`${include.length ? t.ok : t.missing}: ${lang === "it" ? "Cose che deve includere" : "Things it must include"}`);
    checks.push("");
    checks.push(
      lang === "it"
        ? "Suggerimento: se vuoi un risultato migliore, incolla esempi o testo di partenza nel campo “Che cosa hai già”."
        : "Tip: for better results, paste examples or a starting text into “What you already have”."
    );

    return checks.join("\n");
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

  function setTab(next) {
    tab = next;
    if (els.tabPrompt) els.tabPrompt.classList.toggle("active", tab === "prompt");
    if (els.tabCheck) els.tabCheck.classList.toggle("active", tab === "check");
    render();
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
