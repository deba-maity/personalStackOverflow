(function () {
  "use strict";
  const { stacks, guides: fieldGuides } = window.PatchAtlasData;
  const archive = window.PatchAtlasStackOverflow;
  const authored = [
    ...fieldGuides,
    ...archive.guides.map((g) => ({
      ...g,
      symptoms: [g.question.blocks.map((b) => b.text).join("\n\n")],
      cause: g.answer.blocks.map((b) => b.text).join("\n\n"),
    })),
  ];
  const $ = (id) => document.getElementById(id);
  const KEY = "patchAtlasWorkspaceV2";
  const PAGE_SIZE = 8;
  const weights = { critical: 3, high: 2, medium: 1 };
  const viewNames = {
    all: "All guides",
    saved: "Bookmarks",
    resolved: "Resolved",
    custom: "My field notes",
  };
  const icons = {
    library:
      '<rect x="3" y="3" width="7" height="18" rx="1"/><path d="m14 3 6 1-2 17-6-1z"/>',
    bookmark: '<path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    notebook:
      '<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4M3 12h4M3 17h4M10 8h6M10 12h6"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
    upload: '<path d="M12 16V4m-4 4 4-4 4 4M4 16v5h16v-5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    moon: '<path d="M20 14a8 8 0 0 1-10-10A9 9 0 1 0 20 14Z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1.1-1.5 2.5M12 17h.01"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
    "wifi-off":
      '<path d="m3 3 18 18M2 8a16 16 0 0 1 4-2M10 4a16 16 0 0 1 12 4M5 12a11 11 0 0 1 4-2M13 10a10 10 0 0 1 6 2M8 16a6 6 0 0 1 6-1M12 20h.01"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    "arrow-left": '<path d="M20 12H4m6-6-6 6 6 6"/>',
    "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5z"/>',
    pulse: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
    layout:
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    database:
      '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
    "hard-drive":
      '<path d="m5 4-3 11v5h20v-5L19 4ZM2 15h20M16 18h.01M19 18h.01"/>',
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    link: '<path d="m9 15 6-6M8 17l-2 2a4 4 0 0 1-5-5l4-4a4 4 0 0 1 5 0m4-3 2-2a4 4 0 0 1 5 5l-4 4a4 4 0 0 1-5 0"/>',
    edit: '<path d="m4 16-1 5 5-1L21 7l-4-4ZM14 6l4 4"/>',
    print: '<path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6zM17 11h1"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  };
  const icon = (name) =>
    `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
  function hydrate(root = document) {
    root.querySelectorAll("[data-icon]").forEach((el) => {
      el.outerHTML = icon(el.dataset.icon);
    });
  }
  function escape(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  }
  const validId = (value) =>
    typeof value === "string" &&
    /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}$/.test(value) &&
    !["constructor", "prototype"].includes(value);
  const text = (value, max = 20000) =>
    typeof value === "string" ? value.slice(0, max) : "";
  const lines = (value) =>
    text(value)
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean);
  const stringList = (value, max = 100) =>
    Array.isArray(value)
      ? value
          .filter((v) => typeof v === "string")
          .slice(0, max)
          .map((v) => v.slice(0, 20000))
      : [];
  function blankWorkspace() {
    return {
      version: 2,
      custom: [],
      saved: [],
      resolved: [],
      notes: {},
      checks: {},
      recent: [],
    };
  }
  function dictionary(raw, check) {
    return Object.fromEntries(
      Object.entries(
        raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {},
      ).filter(([id, v]) => validId(id) && check(v)),
    );
  }
  function normalizeGuide(raw) {
    if (
      !raw ||
      typeof raw !== "object" ||
      !validId(raw.id) ||
      !text(raw.title, 180).trim()
    )
      return null;
    const stackKey = raw.stackKey || raw.stack;
    const stack = stacks.find((s) => s.key === stackKey) || stacks[0];
    const fixes = Array.isArray(raw.fixes) ? raw.fixes : [];
    return {
      id: raw.id,
      custom: true,
      stack: stack.key,
      category: stack.category,
      title: text(raw.title, 180).trim(),
      summary: text(raw.summary, 2000),
      severity: Object.hasOwn(weights, raw.severity) ? raw.severity : "medium",
      tags: stringList(raw.tags, 12).map((t) => t.slice(0, 60)),
      symptoms: stringList(raw.symptoms),
      cause: text(raw.cause),
      diagnose: text(raw.diagnose),
      bad: text(raw.bad || raw.badCode?.code),
      good: text(raw.good || raw.goodCode || fixes[0]?.code),
      steps: stringList(raw.steps || fixes[0]?.steps),
      verify: stringList(raw.verify || raw.prevention),
      language:
        text(raw.language || raw.badCode?.language, 30) || stack.language,
      created: text(raw.created, 40) || new Date().toISOString(),
    };
  }
  function validateWorkspace(raw) {
    if (
      !raw ||
      typeof raw !== "object" ||
      raw.version !== 2 ||
      !Array.isArray(raw.custom) ||
      !Array.isArray(raw.saved) ||
      raw.custom.length > 1000
    )
      throw new Error("This is not a Patch Atlas v2 backup.");
    if (
      raw.custom.some(
        (g) => !normalizeGuide(g) || authored.some((a) => a.id === g.id),
      )
    )
      throw new Error(
        "A field note in this backup has an invalid or reserved ID.",
      );
    const result = blankWorkspace();
    result.custom = [
      ...new Map(raw.custom.map(normalizeGuide).map((g) => [g.id, g])).values(),
    ];
    result.saved = [...new Set(stringList(raw.saved, 5000).filter(validId))];
    result.resolved = [
      ...new Set(stringList(raw.resolved, 5000).filter(validId)),
    ];
    result.recent = [...new Set(stringList(raw.recent, 20).filter(validId))];
    result.notes = dictionary(
      raw.notes,
      (v) => typeof v === "string" && v.length <= 20000,
    );
    result.checks = Object.fromEntries(
      Object.entries(dictionary(raw.checks, (v) => Array.isArray(v))).map(
        ([id, v]) => [
          id,
          [
            ...new Set(
              v.filter((i) => Number.isInteger(i) && i >= 0 && i < 100),
            ),
          ],
        ],
      ),
    );
    return result;
  }
  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }
  let workspace;
  let unreadableWorkspace = null;
  let protectStoredData = false;
  let storageFailed = false;
  try {
    const raw = localStorage.getItem(KEY);
    unreadableWorkspace = raw;
    workspace = raw ? validateWorkspace(JSON.parse(raw)) : blankWorkspace();
    unreadableWorkspace = null;
  } catch {
    workspace = blankWorkspace();
    storageFailed = true;
    if (unreadableWorkspace !== null) {
      // Preserve the exact unreadable value before any new workspace is saved.
      try {
        localStorage.setItem(KEY + ".recovery", unreadableWorkspace);
      } catch {
        protectStoredData = true;
      }
    }
  }
  const state = {
    query: "",
    source: "all",

    stack: "all",
    category: "all",
    severity: "all",
    sort: "recommended",
    page: 1,
    view: "all",
    collection: "",
    expanded: false,
    selected: null,
    tab: "overview",
  };
  let allGuides = [];
  let saved = new Set(workspace.saved);
  let resolved = new Set(workspace.resolved);
  let toastTimer;
  let offlineReady = false;
  let offlineError = "";
  function toast(message) {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    $("toast").hidden = false;
    toastTimer = setTimeout(() => {
      $("toast").hidden = true;
    }, 4200);
  }
  function persist(quiet = false) {
    workspace.saved = [...saved];
    workspace.resolved = [...resolved];
    if (protectStoredData) {
      if (!quiet)
        toast(
          "Unreadable stored data could not be copied safely. Export a backup of this session before clearing browser storage.",
        );
      return false;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(workspace));
      storageFailed = false;
      return true;
    } catch {
      storageFailed = true;
      if (!quiet)
        toast(
          "Browser storage is unavailable or full. Export a backup to keep your changes.",
        );
      return false;
    }
  }
  function prepare(raw) {
    const stack = stacks.find((s) => s.key === raw.stack);
    const guide = {
      ...raw,
      category: raw.category || stack.category,
      language: raw.language || stack.language,
    };
    guide.search = [
      guide.title,
      guide.summary,
      stack.label,
      guide.tags.join(" "),
      guide.symptoms.join(" "),
      guide.cause,
      guide.diagnose,
      guide.bad,
      guide.good,
      guide.steps.join(" "),
      guide.verify.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    const words = [
      guide.summary,
      guide.cause,
      guide.diagnose,
      ...guide.steps,
      ...guide.verify,
      guide.bad,
      guide.good,
    ]
      .join(" ")
      .split(/\s+/).length;
    guide.minutes = Math.max(2, Math.ceil(words / 160));
    return guide;
  }
  function rebuild() {
    const featured = [
      "react-stale-closure",
      "api-cors-preflight",
      "docker-layer-cache",
      "sql-lost-update",
      "git-reflog-rescue",
      "angular-switchmap",
      "java-transaction-self",
      "node-event-loop",
    ];
    const ordered = [
      ...featured.map((id) => authored.find((g) => g.id === id)),
      ...authored.filter((g) => !featured.includes(g.id)),
    ];
    allGuides = [...workspace.custom, ...ordered].map(prepare);
  }
  function resetFilters() {
    Object.assign(state, {
      query: "",
      stack: "all",
      category: "all",
      severity: "all",
      source: "all",

      page: 1,
      collection: "",
    });
    $("searchInput").value = "";
    $("severitySelect").value = "all";
    $("sourceSelect").value = "all";
  }
  function tokens(query) {
    const result = { words: [], stack: [], tags: [] };
    const matches =
      query
        .toLowerCase()
        .match(/(?:stack|tag):(?:"[^"]*"|[^\s]+)|"[^"]+"|[^\s]+/g) || [];
    for (const token of matches) {
      if (token.startsWith("stack:"))
        result.stack.push(token.slice(6).replace(/"/g, ""));
      else if (token.startsWith("tag:"))
        result.tags.push(token.slice(4).replace(/"/g, ""));
      else result.words.push(token.replace(/^"|"$/g, ""));
    }
    return result;
  }
  function filteredGuides() {
    const query = tokens(state.query);
    const matches = allGuides.filter((g) => {
      if (state.source === "stackoverflow" && g.kind !== "stackoverflow")
        return false;
      if (state.source === "field" && g.kind === "stackoverflow") return false;
      if (state.view === "saved" && !saved.has(g.id)) return false;
      if (state.view === "resolved" && !resolved.has(g.id)) return false;
      if (state.view === "custom" && !g.custom) return false;
      if (state.stack !== "all" && g.stack !== state.stack) return false;
      if (state.category !== "all" && g.category !== state.category)
        return false;
      if (state.severity !== "all" && g.severity !== state.severity)
        return false;
      if (state.collection === "production" && g.severity !== "critical")
        return false;
      const s = stacks.find((s) => s.key === g.stack);
      return (
        query.words.every((w) => g.search.includes(w)) &&
        query.stack.every(
          (w) => g.stack.includes(w) || s.label.toLowerCase().includes(w),
        ) &&
        query.tags.every((w) => g.tags.some((t) => t.toLowerCase().includes(w)))
      );
    });
    const score = (g) =>
      query.words.reduce(
        (sum, w) =>
          sum +
          (g.title.toLowerCase().includes(w) ? 12 : 0) +
          (g.tags.some((t) => t.toLowerCase().includes(w)) ? 6 : 0) +
          (g.summary.toLowerCase().includes(w) ? 3 : 0),
        0,
      );
    if (state.sort === "votes")
      matches.sort(
        (a, b) => (b.question?.score ?? -1) - (a.question?.score ?? -1),
      );
    else if (state.sort === "newest")
      matches.sort(
        (a, b) => (b.question?.created ?? 0) - (a.question?.created ?? 0),
      );
    else if (state.sort === "title")
      matches.sort((a, b) => a.title.localeCompare(b.title));
    else if (state.sort === "severity")
      matches.sort((a, b) => weights[b.severity] - weights[a.severity]);
    else if (state.sort === "reading")
      matches.sort((a, b) => a.minutes - b.minutes);
    else if (state.query.trim()) matches.sort((a, b) => score(b) - score(a));
    return matches;
  }
  function highlight(value) {
    const words = tokens(state.query)
      .words.filter(Boolean)
      .sort((a, b) => b.length - a.length);
    if (!words.length) return escape(value);
    const expression = new RegExp(
      words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
      "gi",
    );
    let last = 0;
    let html = "";
    let match;
    while ((match = expression.exec(value)) !== null) {
      html +=
        escape(value.slice(last, match.index)) +
        "<mark>" +
        escape(match[0]) +
        "</mark>";
      last = match.index + match[0].length;
    }
    return html + escape(value.slice(last));
  }
  function severity(value) {
    return `<span class="severity-pill ${value}">${value}</span>`;
  }
  function stackStyle(s) {
    return `--stack-color:${s.color};--stack-bg:${s.bg}`;
  }
  function renderStacks() {
    const focusedStack = document.activeElement?.dataset.stack;
    $("stackFilters").innerHTML = stacks
      .map(
        (s, i) =>
          `<button type="button" class="stack-filter ${state.stack === s.key ? "active" : ""}" data-stack="${s.key}" aria-pressed="${state.stack === s.key}" ${i >= 8 && !state.expanded && state.stack !== s.key ? "hidden" : ""}><span class="stack-monogram" style="--stack-color:${s.color}">${escape(s.mark)}</span>${escape(s.label)}<span class="nav-count">${allGuides.filter((g) => g.stack === s.key).length}</span></button>`,
      )
      .join("");
    $("clearStack").hidden = state.stack === "all";
    $("showStacks").setAttribute("aria-expanded", String(state.expanded));
    $("showStacks").innerHTML =
      `${state.expanded ? "Show fewer stacks" : `Show all ${stacks.length} stacks`} <span>${state.expanded ? "↑" : "↓"}</span>`;
    if (focusedStack) {
      $("stackFilters")
        .querySelector(`[data-stack="${focusedStack}"]`)
        ?.focus();
    }
  }
  function renderRecent() {
    const recent = workspace.recent
      .map((id) => allGuides.find((g) => g.id === id))
      .filter(Boolean)
      .slice(0, 3);
    $("recentSection").hidden = !recent.length;
    $("recentList").innerHTML = recent
      .map(
        (g) =>
          `<button type="button" data-open="${g.id}">${escape(g.title)}</button>`,
      )
      .join("");
  }
  function render() {
    const items = filteredGuides();
    const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * PAGE_SIZE;
    $("resultCount").textContent = items.length;
    const title =
      state.collection === "production"
        ? "Production is on fire"
        : state.view === "all"
          ? "The field manual"
          : viewNames[state.view];
    $("libraryTitle").firstChild.textContent = title + " ";
    $("breadcrumbTitle").textContent =
      state.collection === "production" ? title : viewNames[state.view];
    const filtered =
      state.source !== "all" ||
      state.query.trim() ||
      state.stack !== "all" ||
      state.category !== "all" ||
      state.severity !== "all" ||
      state.collection;
    $("clearFilters").hidden = !filtered;
    $("resultMeta").textContent = state.query.trim()
      ? `${items.length} guide${items.length === 1 ? "" : "s"} found for “${state.query.trim()}”`
      : filtered
        ? `${items.length} guide${items.length === 1 ? "" : "s"} on this trail. Pick a problem and follow it through.`
        : state.view === "saved"
          ? "Good knowledge, kept within reach."
          : state.view === "custom"
            ? "The things you learned the hard way, kept for next time."
            : state.view === "resolved"
              ? "A record of problems you worked through."
              : "Real problems. Understandable solutions. No template padding.";
    $("allCount").textContent = allGuides.length;
    $("guideCount").textContent = authored.length;
    $("stackCount").textContent = stacks.length;
    $("savedCount").textContent = allGuides.filter((g) =>
      saved.has(g.id),
    ).length;
    $("resolvedCount").textContent = allGuides.filter((g) =>
      resolved.has(g.id),
    ).length;
    $("customCount").textContent = workspace.custom.length;
    document.querySelectorAll("[data-view]").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === state.view);
      b.setAttribute(
        "aria-current",
        b.dataset.view === state.view ? "page" : "false",
      );
    });
    document.querySelectorAll("[data-category]").forEach((b) => {
      b.classList.toggle("active", b.dataset.category === state.category);
      b.setAttribute(
        "aria-pressed",
        String(b.dataset.category === state.category),
      );
    });
    renderStacks();
    $("scenarioList").innerHTML = items
      .slice(start, start + PAGE_SIZE)
      .map((g) => {
        const s = stacks.find((s) => s.key === g.stack);
        return `<article class="scenario-card"><button class="card-main" type="button" data-open="${g.id}"><span class="card-stack" style="${stackStyle(s)}">${escape(s.mark)}</span><span class="card-content"><span class="card-topline"><span>${escape(s.label)}</span><span class="separator">/</span><span>${g.custom ? "Field note" : g.category}</span>${g.kind === "stackoverflow" ? `<span class="qa-badge">Q&A</span>` : severity(g.severity)}</span><strong class="card-title">${highlight(g.title)}</strong><span class="card-summary">${highlight(g.summary)}</span><span class="card-bottom">${g.tags
          .slice(0, 3)
          .map((t) => `<span class="tag">${escape(t)}</span>`)
          .join(
            "",
          )}${resolved.has(g.id) ? `<span class="card-resolved">${icon("check")}Resolved</span>` : ""}<span class="reading-time">${icon("clock")}${g.minutes} min read</span></span></span></button><button type="button" class="icon-button card-save ${saved.has(g.id) ? "saved" : ""}" data-save="${g.id}" aria-label="${saved.has(g.id) ? "Remove bookmark for" : "Bookmark"} ${escape(g.title)}" aria-pressed="${saved.has(g.id)}">${icon("bookmark")}</button></article>`;
      })
      .join("");
    if (!items.length) {
      const empty =
        state.view === "saved" && !filtered
          ? [
              "Your first bookmark is a good beginning.",
              "Save a guide using its bookmark icon. It will be right here when you need it.",
            ]
          : state.view === "custom" && !filtered
            ? [
                "Leave a breadcrumb for next time.",
                "Turn the bug you just solved into your first personal field note.",
              ]
            : state.view === "resolved" && !filtered
              ? [
                  "Every solved bug leaves a trail.",
                  "Open a guide and mark it resolved once you have worked through the fix.",
                ]
              : [
                  "No trail found. Yet.",
                  "Try fewer words, another stack, or an exact error fragment. Your filters may be narrowing things too far.",
                ];
      $("scenarioList").innerHTML =
        `<div class="no-results">${icon("compass")}<h3>${empty[0]}</h3><p>${empty[1]}</p><button type="button" class="primary-button" data-empty-action="${filtered ? "clear" : state.view === "custom" ? "create" : "browse"}">${filtered ? "Clear filters" : state.view === "custom" ? "Write a field note" : "Explore all guides"} ${icon("arrow-right")}</button></div>`;
    }
    $("pagination").hidden = !items.length;
    $("pageInfo").textContent =
      `${start + 1}–${Math.min(start + PAGE_SIZE, items.length)} of ${items.length} guides`;
    $("pageNumber").textContent = `${state.page} / ${pages}`;
    $("prevPage").disabled = state.page === 1;
    $("nextPage").disabled = state.page === pages;
    renderRecent();
  }
  function syntax(source, language) {
    // Tokenize the original source, then escape each token exactly once.
    // This never operates on generated HTML, including user-supplied snippets.
    const pattern =
      /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(?:const|let|var|function|return|if|else|throw|new|await|async|try|catch|finally|import|from|export|default|class|public|private|void|type|interface|for|of|while|true|false|null|undefined|SELECT|FROM|WHERE|UPDATE|SET|AND|NOT|EXISTS|ALTER|TABLE|ADD|COLUMN|RETURNING|AS|IN)\b|\b\d+(?:\.\d+)?\b/g;
    if (["bash", "yaml", "dockerfile"].includes(language))
      return escape(source);
    let result = "";
    let last = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      result += escape(source.slice(last, match.index));
      const token = match[0];
      const kind =
        token.startsWith("//") || token.startsWith("/*")
          ? "comment"
          : /^["'`]/.test(token)
            ? "string"
            : /^\d/.test(token)
              ? "number"
              : "keyword";
      result += `<span class="tok-${kind}">${escape(token)}</span>`;
      last = pattern.lastIndex;
    }
    return result + escape(source.slice(last));
  }
  function codeBlock(source, g, good = false) {
    if (!source)
      return '<p class="muted">No code example recorded yet. Edit this field note to add one.</p>';
    const id = good ? "fixedCode" : "brokenCode";
    return `<div class="code-block"><div class="code-top"><span><span class="code-dot ${good ? "good" : ""}"></span>${good ? "THE FIX" : "BEFORE"} <span>· ${escape(g.language)}</span></span><button type="button" class="copy-button" data-copy="${id}">${icon("copy")}Copy</button></div><pre><code id="${id}">${syntax(source, g.language)}</code></pre></div>`;
  }
  function showReader(id, { route = true, tab = "overview" } = {}) {
    const g = allGuides.find((g) => g.id === id);
    if (!g) {
      toast("This guide is not in this browser’s library.");
      return;
    }
    state.selected = id;
    state.tab = tab;
    workspace.recent = [id, ...workspace.recent.filter((v) => v !== id)].slice(
      0,
      10,
    );
    persist(true);
    renderReader(g);
    if (g.kind === "stackoverflow") renderStackOverflow(g);
    renderRecent();
    if (!$("readerDialog").open) $("readerDialog").showModal();
    $("readerDialog").scrollTop = 0;
    if (route && location.hash !== `#guide/${id}`)
      history.pushState(null, "", `#guide/${id}`);
  }
  function renderReader(g) {
    const stack = stacks.find((s) => s.key === g.stack);
    const checked = workspace.checks[g.id] || [];
    const related = allGuides
      .filter((a) => a.id !== g.id)
      .map((a) => ({
        g: a,
        score:
          (a.stack === g.stack ? 3 : 0) +
          a.tags.filter((t) => g.tags.includes(t)).length,
      }))
      .filter((a) => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    $("scenarioDetail").innerHTML =
      `<div class="reader-top"><span>${icon("book")} PATCH ATLAS <span>/</span> ${g.custom ? "PERSONAL FIELD NOTE" : "FIELD GUIDE"}</span><div class="reader-top-actions"><button type="button" class="icon-button" data-share aria-label="Copy guide link">${icon("link")}</button><button type="button" class="icon-button" data-export-guide aria-label="Download guide as Markdown">${icon("download")}</button><button type="button" class="icon-button" data-print aria-label="Print guide">${icon("print")}</button><button type="button" class="icon-button" data-close="readerDialog" aria-label="Close guide">${icon("x")}</button></div></div><div class="reader-body"><div class="reader-eyebrow"><span class="card-stack" style="${stackStyle(stack)}">${escape(stack.mark)}</span>${escape(stack.label)} ${severity(g.severity)} <span>${g.minutes} min read</span></div><h2 id="readerTitle">${escape(g.title)}</h2><p class="reader-summary">${escape(g.summary)}</p><div class="reader-tags">${g.tags.map((t) => `<span class="tag">${escape(t)}</span>`).join("")}</div><div class="reader-action-bar"><button type="button" class="${saved.has(g.id) ? "primary" : "secondary"}-button" data-save="${g.id}" aria-pressed="${saved.has(g.id)}">${icon("bookmark")}${saved.has(g.id) ? "Bookmarked" : "Bookmark guide"}</button><button type="button" class="${resolved.has(g.id) ? "primary" : "secondary"}-button" data-resolve aria-pressed="${resolved.has(g.id)}">${icon("check")}${resolved.has(g.id) ? "Resolved" : "Mark resolved"}</button>${g.custom ? `<button type="button" class="secondary-button" data-edit="${g.id}">${icon("edit")}Edit field note</button>` : ""}</div><div class="reader-tabs" role="tablist" aria-label="Guide sections">${[
        ["overview", "The diagnosis"],
        ["fix", "The fix"],
        ["notes", "Your notes"],
      ]
        .map(
          ([key, label]) =>
            `<button type="button" id="tab-${key}" role="tab" aria-selected="${state.tab === key}" aria-controls="panel-${key}" tabindex="${state.tab === key ? "0" : "-1"}" data-tab="${key}" class="${state.tab === key ? "active" : ""}">${label}</button>`,
        )
        .join(
          "",
        )}</div><div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" ${state.tab !== "overview" ? "hidden" : ""}><section class="detail-section"><h3><span class="section-number">01</span>Recognize the symptoms</h3>${g.symptoms.length ? `<ul>${g.symptoms.map((v) => `<li>${escape(v)}</li>`).join("")}</ul>` : "<p>No symptoms recorded yet.</p>"}</section><section class="detail-section"><h3><span class="section-number">02</span>Understand the cause</h3><p>${escape(g.cause) || "Root cause not recorded yet."}</p></section>${g.diagnose ? `<div class="diagnosis-box"><h3>Before you change anything</h3><p>${escape(g.diagnose)}</p></div>` : ""}<section class="detail-section"><h3><span class="section-number">03</span>The failure in miniature</h3>${codeBlock(g.bad, g)}</section><button type="button" class="primary-button" data-tab="fix">Walk through the fix ${icon("arrow-right")}</button></div><div role="tabpanel" id="panel-fix" aria-labelledby="tab-fix" ${state.tab !== "fix" ? "hidden" : ""}><section class="detail-section"><h3><span class="section-number">01</span>Make the repair</h3>${g.steps.length ? `<ol>${g.steps.map((v) => `<li>${escape(v)}</li>`).join("")}</ol>` : "<p>No repair steps recorded yet.</p>"}${codeBlock(g.good, g, true)}</section><section class="detail-section"><h3><span class="section-number">02</span>Prove it works</h3><p class="checklist-progress" id="checkProgress">${checked.filter((i) => i < g.verify.length).length} of ${g.verify.length} checks complete</p><div class="checklist">${g.verify.map((v, i) => `<label><input type="checkbox" data-check="${i}" ${checked.includes(i) ? "checked" : ""}><span>${escape(v)}</span></label>`).join("")}</div>${!g.verify.length ? "<p>No verification steps recorded yet.</p>" : ""}</section><p class="guide-note">A field guide gives you a starting point. Adapt the example to your framework version, data model, and failure conditions. Checklist progress records your checks; it does not run them.</p>${g.source ? `<a class="source-link" href="${escape(g.source)}" target="_blank" rel="noopener noreferrer">Read the official reference ↗ <span class="muted">(online)</span></a>` : ""}</div><div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" ${state.tab !== "notes" ? "hidden" : ""}><label class="notes-label" for="personalNotes">What would your future self need to know?</label><textarea id="personalNotes" rows="10" maxlength="20000" placeholder="Your environment, what you tried, the edge case that mattered…">${escape(workspace.notes[g.id] || "")}</textarea><p class="note-status" id="noteStatus">Private to this browser. Saved as you type.</p><p class="guide-note">Take your knowledge with you: Backup exports personal notes, bookmarks, field notes, and checklist progress. Download this guide as Markdown to keep an independently readable copy.</p>${g.custom ? '<section class="detail-section"><button type="button" class="danger-button" data-delete-prompt>Delete this field note</button><div class="delete-confirm" id="deleteConfirm" hidden><p>Delete this field note and its personal notes from this browser? Export a backup first if you want to keep a copy.</p><button type="button" class="danger-button" data-delete-confirm>Delete field note</button><button type="button" class="secondary-button" data-delete-cancel>Keep it</button></div></section>' : ""}</div>${related.length ? `<section class="detail-section"><h3>Keep following the trail</h3><div class="related-list">${related.map(({ g: a }) => `<button type="button" data-open="${a.id}">${escape(a.title)}<span>↗</span></button>`).join("")}</div></section>` : ""}</div>`;
  }
  function postAttribution(post, label) {
    const author = post.author.url
      ? `<a href="${escape(post.author.url)}" target="_blank" rel="noopener noreferrer">${escape(post.author.name)}</a>`
      : escape(post.author.name);
    return `<p><a href="${escape(post.url)}" target="_blank" rel="noopener noreferrer">${label}</a> by ${author} and <a href="https://stackoverflow.com/posts/${post.id}/revisions" target="_blank" rel="noopener noreferrer">contributors</a>.</p>`;
  }
  function postBlocks(post) {
    return post.blocks
      .map((b, i) =>
        b.type === "code"
          ? `<div class="code-block"><div class="code-top"><span>CODE</span><button type="button" class="copy-button" data-copy="post-${post.id}-${i}">${icon("copy")}Copy</button></div><pre><code id="post-${post.id}-${i}">${escape(b.text)}</code></pre></div>`
          : `<p class="post-text">${escape(b.text)}</p>`,
      )
      .join("");
  }
  function renderStackOverflow(g) {
    $("scenarioDetail").querySelector(".reader-top > span").textContent =
      "PATCH ATLAS / STACK OVERFLOW Q&A";
    $("tab-overview").textContent = "The question";
    $("tab-fix").textContent = "Accepted answer";
    $("panel-overview").innerHTML =
      `<section class="detail-section"><h3>The original question · ${g.year}</h3>${postBlocks(g.question)}</section><button type="button" class="primary-button" data-tab="fix">Read the accepted answer ${icon("arrow-right")}</button>`;
    $("panel-fix").innerHTML =
      `<section class="detail-section"><h3>The accepted answer</h3>${postBlocks(g.answer)}</section>`;
    $("scenarioDetail")
      .querySelector(".reader-body")
      .insertAdjacentHTML(
        "beforeend",
        `<details class="source-credits"><summary>Source &amp; license</summary>${postAttribution(g.question, "Question")}${postAttribution(g.answer, "Answer")}<p><a href="${escape(g.license.url)}" target="_blank" rel="license noopener noreferrer">${escape(g.license.name)}</a> ? Formatting adapted; credential-shaped identifiers removed; images represented by text and URLs.</p></details>`,
      );
    $("scenarioDetail")
      .querySelectorAll(".severity-pill")
      .forEach((el) => el.remove());
  }
  function selectTab(tab, focus = false) {
    if (!["overview", "fix", "notes"].includes(tab)) return;
    state.tab = tab;
    document.querySelectorAll("[role=tab][data-tab]").forEach((b) => {
      const active = b.dataset.tab === tab;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll("[role=tabpanel]").forEach((p) => {
      p.hidden = p.id !== `panel-${tab}`;
    });
    if (focus) $(`tab-${tab}`).focus();
  }
  function toggleBookmark(id) {
    const restoreFocus =
      document.activeElement?.dataset.save === id && !$("readerDialog").open;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    const ok = persist();
    render();
    if (restoreFocus) {
      const target =
        $("scenarioList").querySelector(`[data-save="${id}"]`) ||
        $("scenarioList").querySelector("button");
      target?.focus();
    }
    if (state.selected === id && $("readerDialog").open) {
      const button = $("scenarioDetail").querySelector("[data-save]");
      button.innerHTML =
        icon("bookmark") + (saved.has(id) ? "Bookmarked" : "Bookmark guide");
      button.className = (saved.has(id) ? "primary" : "secondary") + "-button";
      button.setAttribute("aria-pressed", String(saved.has(id)));
    }
    if (ok)
      toast(
        saved.has(id)
          ? "Guide bookmarked. A little knowledge, kept close."
          : "Bookmark removed.",
      );
  }
  function openEditor(id) {
    const g = id ? workspace.custom.find((g) => g.id === id) : null;
    $("defectForm").reset();
    $("defectId").value = g?.id || "";
    $("defectDialogTitle").textContent = g
      ? "Edit field note"
      : "New field note";
    for (const [field, key] of [
      ["Title", "title"],
      ["Summary", "summary"],
      ["Cause", "cause"],
      ["BadCode", "bad"],
      ["GoodCode", "good"],
    ])
      $("defect" + field).value = g?.[key] || "";
    for (const [field, key] of [
      ["Symptoms", "symptoms"],
      ["Solutions", "steps"],
      ["Verify", "verify"],
    ])
      $("defect" + field).value = (g?.[key] || []).join("\n");
    $("defectTags").value = (g?.tags || []).join(", ");
    $("defectStack").value =
      g?.stack || (state.stack === "all" ? "react" : state.stack);
    $("defectSeverity").value = g?.severity || "medium";
    $("defectDialog").showModal();
    $("defectTitle").focus();
  }
  function saveEditor() {
    if (!$("defectTitle").value.trim() || !$("defectSummary").value.trim()) {
      toast("Add a title and a short description to your field note.");
      return;
    }
    const id =
      $("defectId").value ||
      `custom-${crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2)}`;
    const previous = workspace.custom.find((g) => g.id === id);
    const g = normalizeGuide({
      id,
      stack: $("defectStack").value,
      title: $("defectTitle").value,
      summary: $("defectSummary").value,
      severity: $("defectSeverity").value,
      symptoms: lines($("defectSymptoms").value),
      cause: $("defectCause").value,
      bad: $("defectBadCode").value,
      good: $("defectGoodCode").value,
      steps: lines($("defectSolutions").value),
      verify: lines($("defectVerify").value),
      tags: $("defectTags")
        .value.split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      created: previous?.created,
    });
    workspace.custom = [g, ...workspace.custom.filter((a) => a.id !== id)];
    const ok = persist();
    rebuild();
    resetFilters();
    state.view = "custom";
    render();
    $("defectDialog").close();
    showReader(id, { tab: previous ? state.tab : "overview" });
    if (ok)
      toast(
        previous
          ? "Field note updated."
          : "Discovery documented. Your future self says thanks.",
      );
  }
  function closeDialog(id) {
    $(id).close();
  }
  function menu(open) {
    $("sidebar").classList.toggle("open", open);
    $("sidebarBackdrop").hidden = !open;
    $("menuButton").setAttribute("aria-expanded", String(open));
    const mobile = matchMedia("(max-width: 760px)").matches;
    $("sidebar").inert = mobile && !open;
    document.querySelector(".page-shell").inert = mobile && open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $("sidebar").querySelector("button").focus();
    else if (mobile) $("menuButton").focus();
  }
  async function copy(value, button) {
    try {
      await navigator.clipboard.writeText(value);
      if (button) {
        button.innerHTML = icon("check") + "Copied";
        setTimeout(() => {
          if (button.isConnected) button.innerHTML = icon("copy") + "Copy";
        }, 1600);
      } else toast("Guide link copied.");
    } catch {
      if (button?.dataset.copy) {
        const range = document.createRange();
        range.selectNodeContents($(button.dataset.copy));
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        toast("Code selected. Use your browser’s copy command.");
      } else
        toast(
          "Clipboard access is unavailable. Copy the guide URL from the address bar.",
        );
    }
  }
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  function guideMarkdown(g, heading = 1) {
    const stack = stacks.find((s) => s.key === g.stack);
    const section = (title, body) =>
      `\n${"#".repeat(heading + 1)} ${title}\n\n${body}\n`;
    const fence = (source) => {
      const length = Math.max(
        3,
        ...Array.from(source.matchAll(/`+/g), (m) => m[0].length + 1),
      );
      return "`".repeat(length);
    };
    const block = (source) =>
      `${fence(source)}${g.language}\n${source}\n${fence(source)}`;
    if (g.kind === "stackoverflow") {
      const attribution = (post, label) =>
        `${label} by ${post.author.url ? `[${post.author.name}](${post.author.url})` : post.author.name} and [contributors](https://stackoverflow.com/posts/${post.id}/revisions). ${post.score} votes.\n\n[Original ${label.toLowerCase()}](${post.url}) · [${g.license.name}](${g.license.url}).\n\nFormatting converted from HTML to text/code. Images represented by descriptions and URLs; credential-shaped identifiers removed; content otherwise unrewritten.`;
      const body = (post) =>
        post.blocks
          .map((b) => (b.type === "code" ? block(b.text) : b.text))
          .join("\n\n");
      return (
        `${"#".repeat(heading)} ${g.title}\n\nStack Overflow · ${g.year} · ${stack.label}\n` +
        section(
          "Question",
          body(g.question) + "\n\n" + attribution(g.question, "Question"),
        ) +
        section(
          "Accepted answer",
          body(g.answer) + "\n\n" + attribution(g.answer, "Answer"),
        ) +
        section(
          "Version context",
          "Accepted by the original asker; check versions and applicability before using this community answer.",
        ) +
        (workspace.notes[g.id]
          ? section("Personal notes", workspace.notes[g.id])
          : "")
      );
    }
    let output = `${"#".repeat(heading)} ${g.title}\n\n${g.summary}\n\n${stack.label} · ${g.severity} · Patch Atlas\n`;
    output += section("Symptoms", g.symptoms.map((s) => "- " + s).join("\n"));
    output +=
      section("Root cause", g.cause) +
      (g.diagnose ? section("Diagnosis", g.diagnose) : "");
    output +=
      section("Before", block(g.bad)) +
      section("Repair", g.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")) +
      section("The fix", block(g.good));
    output += section(
      "Verification",
      g.verify
        .map(
          (s, i) =>
            `- [${(workspace.checks[g.id] || []).includes(i) ? "x" : " "}] ${s}`,
        )
        .join("\n"),
    );
    if (workspace.notes[g.id])
      output += section("Personal notes", workspace.notes[g.id]);
    if (g.source) output += section("Reference", g.source);
    return output;
  }
  function exportGuide(g) {
    download(
      `patch-atlas-${g.id}.md`,
      guideMarkdown(g),
      "text/markdown;charset=utf-8",
    );
  }
  function exportManual() {
    const intro =
      "# Patch Atlas — Your offline field manual\n\n" +
      `${allGuides.length} distinct guides and personal field notes. Exported ${new Date().toISOString().slice(0, 10)}.\n\n` +
      "This file includes your personal annotations and checklist progress. Keep it somewhere you control. " +
      "Examples are starting points; adapt and verify in your own environment. Reference links require a connection, but the full guide text and examples are here.\n\n" +
      "## In this atlas\n\n" +
      allGuides.map((g, i) => `${i + 1}. ${g.title}`).join("\n") +
      "\n\n---\n\n";
    download(
      "patch-atlas-field-manual.md",
      intro + allGuides.map((g) => guideMarkdown(g, 2)).join("\n---\n\n"),
      "text/markdown;charset=utf-8",
    );
  }
  async function importBackup(file) {
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Choose a backup smaller than 10 MB.");
      const incoming = validateWorkspace(JSON.parse(await file.text()));
      const currentIds = new Set(workspace.custom.map((g) => g.id));
      const additions = incoming.custom.filter((g) => !currentIds.has(g.id));
      if (workspace.custom.length + additions.length > 1000)
        throw new Error(
          "This restore would exceed the 1,000 personal field note limit. Nothing was imported.",
        );
      workspace.custom.push(...additions);
      workspace.notes = { ...incoming.notes, ...workspace.notes };
      workspace.checks = { ...incoming.checks, ...workspace.checks };
      saved = new Set([...saved, ...incoming.saved]);
      resolved = new Set([...resolved, ...incoming.resolved]);
      workspace.recent = [
        ...new Set([...workspace.recent, ...incoming.recent]),
      ].slice(0, 10);
      const ok = persist();
      rebuild();
      render();
      if (ok)
        toast(
          "Backup merged. Existing field notes and personal text were kept.",
        );
    } catch (error) {
      toast(
        error instanceof SyntaxError
          ? "This file is not valid JSON. Nothing was imported."
          : error.message,
      );
    } finally {
      $("importFile").value = "";
    }
  }
  async function migrateLegacy() {
    if (readJSON("patchAtlasMigratedV2", false)) return;
    const oldCustom = readJSON("patchAtlasCustomScenarios", []);
    let migrated = 0;
    if (Array.isArray(oldCustom))
      for (const raw of oldCustom) {
        const g = normalizeGuide(raw);
        if (
          g &&
          !authored.some((a) => a.id === g.id) &&
          !workspace.custom.some((a) => a.id === g.id)
        ) {
          workspace.custom.push(g);
          migrated++;
        }
      }
    const oldSaved = readJSON("patchAtlasSaved", []);
    const edits = readJSON("patchAtlasDescriptionEdits", {});
    const safeEdits = dictionary(edits, (v) => typeof v === "string");
    const wanted = new Set([
      ...(Array.isArray(oldSaved) ? oldSaved.filter(validId) : []),
      ...Object.keys(safeEdits),
    ]);
    if (wanted.size) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "legacy.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.append(script);
        });
        const recovered = window.PatchAtlasLegacy.buildScenarios(wanted);
        for (const raw of recovered) {
          if (Object.hasOwn(safeEdits, raw.id)) raw.summary = safeEdits[raw.id];
          raw.title = "[Legacy] " + raw.title;
          const g = normalizeGuide(raw);
          if (g && !workspace.custom.some((a) => a.id === g.id)) {
            workspace.custom.push(g);
            migrated++;
          }
        }
        delete window.PatchAtlasLegacy;
      } catch {
        toast(
          "Could not recover the old catalog yet. Original browser data has been kept for another attempt.",
        );
        rebuild();
        render();
        persist();
        return;
      }
    }
    for (const id of wanted)
      if (Array.isArray(oldSaved) && oldSaved.includes(id)) saved.add(id);
    rebuild();
    render();
    if (persist(true)) {
      try {
        localStorage.setItem("patchAtlasMigratedV2", "true");
      } catch {}
    }
    if (migrated)
      toast(
        `${migrated} existing entr${migrated === 1 ? "y" : "ies"} recovered in My field notes.`,
      );
  }
  function syncRoute() {
    if (location.hash.startsWith("#guide/")) {
      const id = location.hash.slice(7);
      if (validId(id) && allGuides.some((g) => g.id === id))
        showReader(id, { route: false });
      else
        toast(
          "That guide is not available in this library. Restore its backup if it is a personal note.",
        );
    } else if ($("readerDialog").open) $("readerDialog").close();
  }
  function updateTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    $("themeButton").innerHTML = icon(dark ? "moon" : "sun");
    $("themeButton").setAttribute(
      "aria-label",
      `Switch to ${dark ? "light" : "dark"} theme`,
    );
  }
  function updateConnection() {
    $("connectionText").textContent = offlineReady
      ? navigator.onLine
        ? "Offline ready"
        : "Offline · ready"
      : location.protocol === "file:"
        ? "Local file library"
        : navigator.onLine
          ? "Local library"
          : "Offline";
    $("offlineDescription").textContent =
      location.protocol === "file:"
        ? "You are opening local files. Keep this project folder to use the entire library without a connection."
        : offlineReady
          ? "The full library is cached. Reopen this address even without a connection. Keep a backup of your personal notes."
          : offlineError ||
            "Preparing an offline copy of the whole library, not just your bookmarks.";
  }
  async function setupOffline() {
    if (location.protocol === "file:") {
      updateConnection();
      return;
    }
    if (!("serviceWorker" in navigator)) {
      offlineError =
        "This browser cannot cache the app for offline reopening. Keep the project files as your fallback.";
      updateConnection();
      return;
    }
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");
      await navigator.serviceWorker.ready;
      // Cache existence alone is not readiness: installation must finish all assets.
      offlineReady = Boolean(registration.active);
      updateConnection();
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        offlineReady = true;
        updateConnection();
      });
    } catch {
      offlineError =
        "Offline caching was unavailable. Serve on localhost or HTTPS; the downloaded project also opens directly.";
      updateConnection();
    }
  }
  function bind() {
    for (const [id, key] of [["sourceSelect", "source"]]) {
      $(id).addEventListener("change", (e) => {
        state[key] = e.target.value;
        state.page = 1;
        render();
      });
    }
    $("searchInput").addEventListener("input", () => {
      state.query = $("searchInput").value;
      state.page = 1;
      render();
    });
    $("sortSelect").addEventListener("change", (e) => {
      state.sort = e.target.value;
      state.page = 1;
      render();
    });
    $("severitySelect").addEventListener("change", (e) => {
      state.severity = e.target.value;
      state.page = 1;
      render();
    });
    $("prevPage").addEventListener("click", () => {
      state.page--;
      render();
      $("libraryTitle").scrollIntoView({ block: "start" });
    });
    $("nextPage").addEventListener("click", () => {
      state.page++;
      render();
      $("libraryTitle").scrollIntoView({ block: "start" });
    });
    $("clearFilters").addEventListener("click", () => {
      resetFilters();
      render();
    });
    $("clearStack").addEventListener("click", () => {
      state.stack = "all";
      state.page = 1;
      render();
    });
    $("showStacks").addEventListener("click", () => {
      state.expanded = !state.expanded;
      renderStacks();
    });
    $("createButton").addEventListener("click", () => openEditor());
    $("kitCreate").addEventListener("click", () => openEditor());
    $("helpButton").addEventListener("click", () =>
      $("helpDialog").showModal(),
    );
    $("footerHelp").addEventListener("click", () =>
      $("helpDialog").showModal(),
    );
    $("themeButton").addEventListener("click", () => {
      const theme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem("patchAtlasTheme", theme);
      } catch {
        toast(
          "Theme changed for this session; browser storage is unavailable.",
        );
      }
      updateTheme();
    });
    $("menuButton").addEventListener("click", () =>
      menu(!$("sidebar").classList.contains("open")),
    );
    $("sidebarBackdrop").addEventListener("click", () => menu(false));
    $("backupButton").addEventListener("click", () => {
      workspace.saved = [...saved];
      workspace.resolved = [...resolved];
      download(
        `patch-atlas-backup-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(
          { ...workspace, exportedAt: new Date().toISOString() },
          null,
          2,
        ),
        "application/json",
      );
    });
    $("exportManualButton").addEventListener("click", exportManual);
    $("importButton").addEventListener("click", () => $("importFile").click());
    $("importFile").addEventListener("change", (e) =>
      importBackup(e.target.files[0]),
    );
    $("offlineButton").addEventListener("click", () => {
      updateConnection();
      toast(
        location.protocol === "file:"
          ? "Local-file mode: keep this project folder for fully offline access."
          : offlineReady
            ? "All library files are cached for offline reopening."
            : offlineError ||
              "Offline copy is still preparing. Check again in a moment.",
      );
    });
    $("defectForm").addEventListener("submit", (e) => {
      e.preventDefault();
      saveEditor();
    });
    $("readerDialog").addEventListener("close", () => {
      state.selected = null;
      if (location.hash.startsWith("#guide/"))
        history.replaceState(null, "", location.pathname + location.search);
    });
    document.querySelectorAll("dialog").forEach((dialog) =>
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
          const r = dialog.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            dialog.close();
        }
      }),
    );
    document.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;
      if (button.dataset.close) closeDialog(button.dataset.close);
      else if (button.dataset.open) showReader(button.dataset.open);
      else if (button.dataset.save) toggleBookmark(button.dataset.save);
      else if (button.dataset.view) {
        state.view = button.dataset.view;
        resetFilters();
        render();
        if ($("sidebar").classList.contains("open")) menu(false);
      } else if (button.dataset.stack) {
        state.stack =
          state.stack === button.dataset.stack ? "all" : button.dataset.stack;
        state.page = 1;
        render();
        if ($("sidebar").classList.contains("open")) menu(false);
      } else if (button.dataset.category) {
        state.category = button.dataset.category;
        state.collection = "";
        state.page = 1;
        render();
      } else if (Object.hasOwn(button.dataset, "query")) {
        resetFilters();
        state.view = "all";
        state.query = button.dataset.query;
        $("searchInput").value = state.query;
        render();
      } else if (button.dataset.collection) {
        resetFilters();
        state.view = "all";
        if (button.dataset.collection === "production")
          state.collection = "production";
        else state.category = button.dataset.collection;
        render();
        $("libraryTitle").scrollIntoView({ block: "start" });
      } else if (button.dataset.emptyAction) {
        if (button.dataset.emptyAction === "create") openEditor();
        else {
          if (button.dataset.emptyAction === "browse") state.view = "all";
          resetFilters();
          render();
        }
      } else if (button.dataset.tab) selectTab(button.dataset.tab);
      else if (button.dataset.copy)
        copy($(button.dataset.copy).textContent, button);
      else if (button.dataset.edit) openEditor(button.dataset.edit);
      else if (Object.hasOwn(button.dataset, "resolve")) {
        const id = state.selected;
        resolved.has(id) ? resolved.delete(id) : resolved.add(id);
        const ok = persist();
        render();
        button.innerHTML =
          icon("check") + (resolved.has(id) ? "Resolved" : "Mark resolved");
        button.className =
          (resolved.has(id) ? "primary" : "secondary") + "-button";
        button.setAttribute("aria-pressed", String(resolved.has(id)));
        if (ok)
          toast(
            resolved.has(id)
              ? "Marked resolved. Another problem understood."
              : "Resolution status cleared.",
          );
      } else if (Object.hasOwn(button.dataset, "share")) copy(location.href);
      else if (Object.hasOwn(button.dataset, "exportGuide"))
        exportGuide(allGuides.find((g) => g.id === state.selected));
      else if (Object.hasOwn(button.dataset, "print")) window.print();
      else if (Object.hasOwn(button.dataset, "deletePrompt")) {
        $("deleteConfirm").hidden = false;
        $("deleteConfirm").querySelector("[data-delete-cancel]").focus();
      } else if (Object.hasOwn(button.dataset, "deleteCancel"))
        $("deleteConfirm").hidden = true;
      else if (Object.hasOwn(button.dataset, "deleteConfirm")) {
        const id = state.selected;
        workspace.custom = workspace.custom.filter((g) => g.id !== id);
        saved.delete(id);
        resolved.delete(id);
        delete workspace.notes[id];
        delete workspace.checks[id];
        workspace.recent = workspace.recent.filter((v) => v !== id);
        const ok = persist();
        rebuild();
        $("readerDialog").close();
        render();
        if (ok) toast("Field note deleted from this browser.");
      }
    });
    $("scenarioDetail").addEventListener("input", (e) => {
      if (e.target.id === "personalNotes") {
        workspace.notes[state.selected] = e.target.value;
        const ok = persist(true);
        $("noteStatus").textContent = ok
          ? "Saved on this device."
          : "Not persisted: browser storage is full or unavailable. Export a backup.";
      }
    });
    $("scenarioDetail").addEventListener("change", (e) => {
      if (e.target.matches("[data-check]")) {
        const g = allGuides.find((g) => g.id === state.selected);
        const set = new Set(workspace.checks[g.id] || []);
        const index = Number(e.target.dataset.check);
        e.target.checked ? set.add(index) : set.delete(index);
        workspace.checks[g.id] = [...set];
        persist();
        $("checkProgress").textContent =
          `${set.size} of ${g.verify.length} checks complete`;
      }
    });
    document.addEventListener("keydown", (e) => {
      const editing = e.target.matches(
        "input,textarea,select,[contenteditable=true]",
      );
      if (e.key === "Escape" && $("sidebar").classList.contains("open")) {
        e.preventDefault();
        menu(false);
        return;
      }
      if (
        e.target.matches("[role=tab]") &&
        ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
      ) {
        e.preventDefault();
        const tabs = ["overview", "fix", "notes"];
        const index = tabs.indexOf(state.tab);
        selectTab(
          tabs[
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? 2
                : (index + (e.key === "ArrowRight" ? 1 : 2)) % 3
          ],
          true,
        );
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (document.querySelector("dialog[open]")) return;
        $("searchInput").focus();
        return;
      }
      if (
        editing ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        document.querySelector("dialog[open]")
      )
        return;
      if (e.key === "/") {
        e.preventDefault();
        $("searchInput").focus();
      }
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        openEditor();
      }
      if (e.key === "?") {
        e.preventDefault();
        $("helpDialog").showModal();
      }
      if (e.key === "Tab" && $("sidebar").classList.contains("open")) {
        const focusable = [
          ...$("sidebar").querySelectorAll("a,button,input"),
        ].filter((el) => !el.hidden && el.getClientRects().length);
        if (e.shiftKey && e.target === focusable[0]) {
          e.preventDefault();
          focusable.at(-1).focus();
        } else if (!e.shiftKey && e.target === focusable.at(-1)) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    });
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    matchMedia("(max-width: 760px)").addEventListener("change", () => {
      if ($("sidebar").classList.contains("open")) menu(false);
      $("sidebar").inert = matchMedia("(max-width: 760px)").matches;
    });
  }
  async function init() {
    hydrate();
    updateTheme();
    $("sidebar").inert = matchMedia("(max-width: 760px)").matches;
    $("defectStack").innerHTML = stacks
      .map((s) => `<option value="${s.key}">${escape(s.label)}</option>`)
      .join("");
    rebuild();
    bind();
    render();
    updateConnection();
    if (storageFailed)
      toast(
        "Stored workspace could not be read. Existing browser data was kept; restore a backup or export current work.",
      );
    await migrateLegacy();
    syncRoute();
    setupOffline();
  }
  init();
})();
