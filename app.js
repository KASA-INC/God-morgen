const DEFAULT_STATE = {
  soundEnabled: true,
  bonusTasksEnabled: true,
  scoring: { basePoints: 10, maxBonus: 5 },
  children: {},
  history: [],
  activeSessions: {},
  wildcards: {},
  wildcardHistory: {},
  dayStatusOverrides: {},
  streaks: {},
  pointBank: {},
  levelProgress: {},
  rewardCatalog: [],
  rewardRedemptions: [],
  meta: { updatedAt: 0 },
};

const DEFAULT_REWARD_CATALOG = [
  { id: "velg-film", title: "Velg filmkveld", cost: 150 },
  { id: "velg-middag", title: "Velg middag", cost: 250 },
  { id: "storpremie", title: "Større premie", cost: 500 },
];
const POINT_MILESTONES = [100, 250, 500, 750, 1000];
const DAY_BONUSES = {
  sickBonus: 10,
  weekendSickBonus: 20,
};

const DEFAULT_WILDCARD_TASKS = [
  { id: "kompliment", title: "Gi et ekte kompliment til en hjemme i dag" },
  { id: "rydde-5", title: "Rydd i 5 minutter på et valgfritt sted" },
  { id: "hjelpe-hand", title: "Tilby hjelp uten å bli spurt" },
  { id: "vannpause", title: "Drikk et glass vann før dere går" },
  { id: "smil", title: "Få noen til å smile før dere drar" },
  { id: "ryggsekk", title: "Sjekk at sekken er klar helt selv" },
  { id: "bordet", title: "Hjelp med å dekke eller rydde bordet" },
  { id: "takknemlig", title: "Si én ting du er takknemlig for i dag" },
];
const WILDCARD_HISTORY_LIMIT = 20;
const WILDCARD_REPEAT_GUARD = 4;
let wildcardTasks = [...DEFAULT_WILDCARD_TASKS];

const DEFAULT_LEVEL_DEFINITIONS = [
  { level: 1, name: "Maur", requiredCompletedTasks: 0 },
  { level: 2, name: "Marihøne", requiredCompletedTasks: 5 },
  { level: 3, name: "Sommerfugl", requiredCompletedTasks: 12 },
  { level: 4, name: "Bie", requiredCompletedTasks: 22 },
  { level: 5, name: "Gresshoppe", requiredCompletedTasks: 35 },
  { level: 6, name: "Frosk", requiredCompletedTasks: 52 },
  { level: 7, name: "Mus", requiredCompletedTasks: 74 },
  { level: 8, name: "Ekorn", requiredCompletedTasks: 102 },
  { level: 9, name: "Pinnsvin", requiredCompletedTasks: 138 },
  { level: 10, name: "Ravn", requiredCompletedTasks: 184 },
  { level: 11, name: "Rev", requiredCompletedTasks: 242 },
  { level: 12, name: "Gaupe", requiredCompletedTasks: 314 },
  { level: 13, name: "Ulv", requiredCompletedTasks: 402 },
  { level: 14, name: "Hjort", requiredCompletedTasks: 510 },
  { level: 15, name: "Elg", requiredCompletedTasks: 642 },
  { level: 16, name: "Løve", requiredCompletedTasks: 804 },
  { level: 17, name: "Tiger", requiredCompletedTasks: 1002 },
  { level: 18, name: "Neshorn", requiredCompletedTasks: 1244 },
  { level: 19, name: "Isbjørn", requiredCompletedTasks: 1540 },
  { level: 20, name: "Flodhest", requiredCompletedTasks: 1902 },
  { level: 21, name: "Sjøløve", requiredCompletedTasks: 2344 },
  { level: 22, name: "Hvalross", requiredCompletedTasks: 2882 },
  { level: 23, name: "Delfin", requiredCompletedTasks: 3538 },
  { level: 24, name: "Havskilpadde", requiredCompletedTasks: 4336 },
  { level: 25, name: "Hammerhai", requiredCompletedTasks: 5308 },
  { level: 26, name: "Spekkhogger", requiredCompletedTasks: 6492 },
  { level: 27, name: "Kjempeblekksprut", requiredCompletedTasks: 7934 },
  { level: 28, name: "Pukkelhval", requiredCompletedTasks: 9692 },
  { level: 29, name: "Finhval", requiredCompletedTasks: 11836 },
  { level: 30, name: "Blåhval", requiredCompletedTasks: 20000 },
];
let levelDefinitions = [...DEFAULT_LEVEL_DEFINITIONS];

const ACCENT_THEME_COLORS = ["#fddc75", "#78aa78", "#32aabe", "#f082aa", "#fda075"];

function hexToRgbString(hex) {
  const clean = String(hex || "").replace("#", "").trim();
  if (clean.length !== 6) return "253, 160, 117";
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  if (![r, g, b].every(Number.isFinite)) return "253, 160, 117";
  return `${r}, ${g}, ${b}`;
}

function applyRandomAccentTheme() {
  const color = ACCENT_THEME_COLORS[Math.floor(Math.random() * ACCENT_THEME_COLORS.length)] || "#fda075";
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accent-rgb", hexToRgbString(color));
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute("content", color);
}

const STORAGE_KEY = "morgenhelt-state-v1";
let state = loadState();
const sessions = createAllSessions();
let timerId = null;
let audioCtx = null;

const authScreen = document.getElementById("authScreen");
const appShell = document.getElementById("appShell");
const authStatus = document.getElementById("authStatus");
const authEmailInput = document.getElementById("authEmail");
const authPasswordInput = document.getElementById("authPassword");
const authGuestBtn = document.getElementById("authGuest");
const authEmailSignInBtn = document.getElementById("authEmailSignIn");
const authEmailCreateBtn = document.getElementById("authEmailCreate");

const childBoards = document.getElementById("childBoards");
const pointsOverviewEl = document.getElementById("pointsOverview");
const weeklyStatsEl = document.getElementById("weeklyStats");
const addChildBtn = document.getElementById("addChildBtn");
const childNameInput = document.getElementById("newChildName");
const emptyState = document.getElementById("emptyState");

const openParentModeBtn = document.getElementById("openParentMode");

const parentDialog = document.getElementById("parentDialog");
const parentSettings = document.getElementById("parentSettings");
const closeSettingsX = document.getElementById("closeSettingsX");
const soundToggle = document.getElementById("soundToggle");
const bonusTasksToggle = document.getElementById("bonusTasksToggle");
const basePoints = document.getElementById("basePoints");
const bonusPoints = document.getElementById("bonusPoints");
const basePlus = document.getElementById("basePlus");
const baseMinus = document.getElementById("baseMinus");
const bonusPlus = document.getElementById("bonusPlus");
const bonusMinus = document.getElementById("bonusMinus");
const basePointsDisplay = document.getElementById("basePointsDisplay");
const bonusPointsDisplay = document.getElementById("bonusPointsDisplay");
const rewardSettingsList = document.getElementById("rewardSettingsList");
const rewardTitleInput = document.getElementById("rewardTitleInput");
const rewardCostInput = document.getElementById("rewardCostInput");
const addRewardBtn = document.getElementById("addRewardBtn");
const settingsLogout = document.getElementById("settingsLogout");

const cloud = createCloudAdapter();

applyRandomAccentTheme();
renderAll();
startTimerLoop();
registerServiceWorker();
setupAuthUI();
cloud.init();
loadWildcardTasks();
loadAnimalLevels();

function createAllSessions() {
  return sanitizeActiveSessions(state.activeSessions, state.children);
}

function createSession(childName) {
  return { childName, startedAt: null, lastTaskAt: null, completedTasks: {}, score: 0 };
}

function sanitizeActiveSessions(rawSessions, childrenSource = state.children) {
  const source = rawSessions && typeof rawSessions === "object" ? rawSessions : {};

  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const base = createSession(childName);
      const incoming = source[childName];
      if (!incoming || typeof incoming !== "object") return [childName, base];

      const startedAt = Number(incoming.startedAt);
      const lastTaskAt = Number(incoming.lastTaskAt);
      const score = Number(incoming.score);
      const completedRaw = incoming.completedTasks && typeof incoming.completedTasks === "object" ? incoming.completedTasks : {};
      const completedTasks = {};

      Object.entries(completedRaw).forEach(([idx, details]) => {
        if (!details || typeof details !== "object") return;
        const points = Number(details.points);
        const durationSec = Number(details.durationSec);
        const completedAtMs = Number(details.completedAtMs);
        if (!Number.isFinite(points) || !Number.isFinite(durationSec) || !Number.isFinite(completedAtMs)) return;
        const taskName = typeof details.taskName === "string" ? details.taskName : undefined;
        const isWildcard = !!details.isWildcard;
        completedTasks[idx] = {
          points: Math.max(0, Math.round(points)),
          durationSec: Math.max(1, Math.round(durationSec)),
          completedAtMs: Math.max(0, Math.round(completedAtMs)),
          ...(taskName ? { taskName } : {}),
          ...(isWildcard ? { isWildcard } : {}),
        };
      });

      return [
        childName,
        {
          childName,
          startedAt: Number.isFinite(startedAt) && startedAt > 0 ? Math.round(startedAt) : null,
          lastTaskAt: Number.isFinite(lastTaskAt) && lastTaskAt > 0 ? Math.round(lastTaskAt) : null,
          completedTasks,
          score: Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0,
        },
      ];
    })
  );
}

function syncActiveSessionsIntoState() {
  state.activeSessions = sanitizeActiveSessions(sessions, state.children);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeChildren(rawChildren) {
  const source = rawChildren && typeof rawChildren === "object" ? rawChildren : {};

  return Object.fromEntries(
    Object.entries(source).map(([name, info]) => {
      const validInfo = info && typeof info === "object" ? info : {};
      const routines = Array.isArray(validInfo.routines)
        ? validInfo.routines.filter((task) => typeof task === "string" && task.trim()).map((task) => task.trim())
        : [];

      return [
        name,
        {
          age: Number.isFinite(validInfo.age) ? Math.max(0, Math.round(validInfo.age)) : 0,
          routines,
        },
      ];
    })
  );
}

function sanitizeWildcards(rawWildcards, childrenSource = state.children) {
  const source = rawWildcards && typeof rawWildcards === "object" ? rawWildcards : {};

  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const entry = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      return [
        childName,
        {
          dateKey: typeof entry.dateKey === "string" ? entry.dateKey : "",
          taskId: typeof entry.taskId === "string" ? entry.taskId : "",
        },
      ];
    })
  );
}


function sanitizeWildcardCatalog(rawCatalog) {
  if (!Array.isArray(rawCatalog)) return [];

  const seen = new Set();
  const rows = [];
  rawCatalog.forEach((row, index) => {
    const title = typeof row?.title === "string" ? row.title.trim() : "";
    const fromId = typeof row?.id === "string" ? row.id.trim() : "";
    const fallbackId = `wildcard-${index + 1}`;
    const id = (fromId || fallbackId).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!title || !id || seen.has(id)) return;
    seen.add(id);
    rows.push({ id, title });
  });

  return rows;
}

async function loadWildcardTasks() {
  try {
    const response = await fetch("./wildcard-tasks.json", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const nextTasks = sanitizeWildcardCatalog(payload);
    if (!nextTasks.length) return;

    wildcardTasks = nextTasks;
    renderBoards();
  } catch {
    // fallback til innebygde wildcard-oppgaver
  }
}

function sanitizeLevelDefinitions(rawDefinitions) {
  if (!Array.isArray(rawDefinitions)) return [];

  const rows = rawDefinitions
    .map((row) => ({
      level: Number(row?.level),
      name: typeof row?.name === "string" ? row.name.trim() : "",
      requiredCompletedTasks: Number(row?.requiredCompletedTasks),
    }))
    .filter((row) => Number.isFinite(row.level) && row.level > 0 && row.name && Number.isFinite(row.requiredCompletedTasks) && row.requiredCompletedTasks >= 0)
    .map((row) => ({
      level: Math.round(row.level),
      name: row.name,
      requiredCompletedTasks: Math.round(row.requiredCompletedTasks),
    }))
    .sort((a, b) => a.requiredCompletedTasks - b.requiredCompletedTasks || a.level - b.level);

  const dedup = [];
  const seen = new Set();
  rows.forEach((row) => {
    if (seen.has(row.level)) return;
    seen.add(row.level);
    dedup.push(row);
  });
  return dedup;
}

async function loadAnimalLevels() {
  try {
    const response = await fetch("./animal-levels.json", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const nextDefs = sanitizeLevelDefinitions(payload);
    if (!nextDefs.length) return;

    levelDefinitions = nextDefs;
    renderBoards();
  } catch {
    // fallback til innebygde nivådefinisjoner
  }
}

function sanitizeLevelProgress(rawProgress, childrenSource = state.children) {
  const source = rawProgress && typeof rawProgress === "object" ? rawProgress : {};
  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const row = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      const completedTasksTotal = Number(row.completedTasksTotal);
      return [childName, { completedTasksTotal: Number.isFinite(completedTasksTotal) ? Math.max(0, Math.round(completedTasksTotal)) : 0 }];
    })
  );
}

function resolveLevelInfo(completedTasksTotal) {
  const defs = levelDefinitions.length ? levelDefinitions : DEFAULT_LEVEL_DEFINITIONS;
  const total = Math.max(0, Math.round(Number(completedTasksTotal) || 0));

  let current = defs[0];
  let next = null;
  defs.forEach((row, idx) => {
    if (total >= row.requiredCompletedTasks) {
      current = row;
      next = defs[idx + 1] || null;
    }
  });

  const progressPct = next
    ? Math.max(0, Math.min(100, Math.round(((total - current.requiredCompletedTasks) / Math.max(1, next.requiredCompletedTasks - current.requiredCompletedTasks)) * 100)))
    : 100;

  return { current, next, total, progressPct };
}

function ensureChildLevelProgress(childName) {
  if (!state.levelProgress[childName]) {
    state.levelProgress[childName] = { completedTasksTotal: 0 };
  }
  return state.levelProgress[childName];
}

function sanitizeWildcardHistory(rawHistory, childrenSource = state.children) {
  const source = rawHistory && typeof rawHistory === "object" ? rawHistory : {};

  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const entries = Array.isArray(source[childName]) ? source[childName] : [];
      return [
        childName,
        entries.filter((taskId) => typeof taskId === "string" && taskId.trim()).slice(-WILDCARD_HISTORY_LIMIT),
      ];
    })
  );
}

function sanitizePointBank(rawBank, childrenSource = state.children) {
  const source = rawBank && typeof rawBank === "object" ? rawBank : {};
  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const row = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      const earnedTotal = Number(row.earnedTotal);
      const spentTotal = Number(row.spentTotal);
      const claimedMilestones = Array.isArray(row.claimedMilestones)
        ? row.claimedMilestones.filter((v) => Number.isFinite(Number(v))).map((v) => Number(v))
        : [];
      return [
        childName,
        {
          earnedTotal: Number.isFinite(earnedTotal) ? Math.max(0, Math.round(earnedTotal)) : 0,
          spentTotal: Number.isFinite(spentTotal) ? Math.max(0, Math.round(spentTotal)) : 0,
          claimedMilestones,
        },
      ];
    })
  );
}

function sanitizeDayStatusOverrides(rawOverrides, childrenSource = state.children) {
  const source = rawOverrides && typeof rawOverrides === "object" ? rawOverrides : {};
  const validStatuses = new Set(["normal", "holiday", "sick"]);

  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const childRows = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      const cleanRows = Object.fromEntries(
        Object.entries(childRows).filter(([dateKey, status]) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && validStatuses.has(status))
      );
      return [childName, cleanRows];
    })
  );
}

function sanitizeStreaks(rawStreaks, childrenSource = state.children) {
  const source = rawStreaks && typeof rawStreaks === "object" ? rawStreaks : {};
  return Object.fromEntries(
    Object.keys(childrenSource).map((childName) => {
      const row = source[childName] && typeof source[childName] === "object" ? source[childName] : {};
      const count = Number(row.count);
      return [
        childName,
        {
          count: Number.isFinite(count) ? Math.max(0, Math.round(count)) : 0,
          lastCompletedDate: typeof row.lastCompletedDate === "string" ? row.lastCompletedDate : "",
        },
      ];
    })
  );
}

function sanitizeRewardCatalog(rawCatalog) {
  const source = Array.isArray(rawCatalog) ? rawCatalog : DEFAULT_REWARD_CATALOG;
  return source
    .map((item, index) => {
      const title = typeof item?.title === "string" ? item.title.trim() : "";
      const id = typeof item?.id === "string" && item.id.trim() ? item.id.trim() : `reward-${index + 1}`;
      const cost = Number(item?.cost);
      if (!title || !Number.isFinite(cost) || cost <= 0) return null;
      return { id, title, cost: Math.round(cost) };
    })
    .filter(Boolean);
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      scoring: { ...structuredClone(DEFAULT_STATE).scoring, ...parsed.scoring },
      children: sanitizeChildren(parsed.children),
      history: Array.isArray(parsed.history) ? parsed.history : [],
      activeSessions: sanitizeActiveSessions(parsed.activeSessions, sanitizeChildren(parsed.children)),
      wildcards: sanitizeWildcards(parsed.wildcards, sanitizeChildren(parsed.children)),
      wildcardHistory: sanitizeWildcardHistory(parsed.wildcardHistory, sanitizeChildren(parsed.children)),
      dayStatusOverrides: sanitizeDayStatusOverrides(parsed.dayStatusOverrides, sanitizeChildren(parsed.children)),
      streaks: sanitizeStreaks(parsed.streaks, sanitizeChildren(parsed.children)),
      pointBank: sanitizePointBank(parsed.pointBank, sanitizeChildren(parsed.children)),
      levelProgress: sanitizeLevelProgress(parsed.levelProgress, sanitizeChildren(parsed.children)),
      rewardCatalog: sanitizeRewardCatalog(parsed.rewardCatalog),
      rewardRedemptions: Array.isArray(parsed.rewardRedemptions) ? parsed.rewardRedemptions : [],
      meta: { updatedAt: Number(parsed?.meta?.updatedAt) || 0 },
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  syncActiveSessionsIntoState();
  state.meta = { updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  cloud.pushState(structuredClone(state));
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

function renderAll() {
  renderBoards();
  renderPointsOverview();
  renderStats();
}



function renderBoards() {
  childBoards.innerHTML = "";
  const names = Object.keys(state.children);
  if (!names.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  let wildcardStateChanged = false;

  Object.entries(state.children).forEach(([name, info]) => {
    const session = sessions[name] || createSession(name);
    sessions[name] = session;
    const doneCount = countRoutineCompletions(session);
    const total = info.routines.length;
    const todayKey = getLocalDateKey();
    const manualStatus = getChildDayOverride(name, todayKey);
    const effectiveMode = getEffectiveDayMode(todayKey, manualStatus);
    const requiredCount = getRequiredRoutineCount(total, effectiveMode);
    const streak = ensureChildStreak(name);
    const started = !!session.startedAt;
    const progress = requiredCount ? Math.min(100, Math.round((doneCount / requiredCount) * 100)) : 100;
    const wildcardEnabled = state.bonusTasksEnabled !== false;
    const wildcardState = wildcardEnabled ? getOrAssignDailyWildcard(name) : null;
    if (wildcardState?.didAssign) wildcardStateChanged = true;
    const wildcardTask = wildcardState?.task || null;
    const wildcardTaskKey = wildcardState ? `wildcard:${wildcardState.dateKey}` : null;
    const wildcardDone = wildcardTaskKey ? !!session.completedTasks[wildcardTaskKey] : false;

    const board = document.createElement("section");
    board.className = "child-board";
    board.innerHTML = `
      <div class="child-head">
        <h3>${escapeHtml(name)}</h3>
        <div class="badges">
          <span class="badge badge-clock">${formatElapsed(session.startedAt)}</span>
          <span class="badge badge-score"><span class="score-star">★</span> <span class="score-value">${session.score}</span></span>
          <span class="badge badge-level"></span>
          <span class="badge badge-streak">🔥 ${streak.count}</span>
        </div>
        <button class="icon-btn remove-child-btn" type="button" aria-label="Fjern barn">✕</button>
      </div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p>${requiredCount ? `${doneCount} av ${requiredCount} fullført` : "I dag er det fridag"}</p>
      <div class="day-status-row">
        <small>Automatisk: ${getBaseDayType(todayKey) === "weekend" ? "Helg" : "Ukedag"}</small>
        <label>Dagens status
          <select class="day-status-select">
            <option value="normal" ${manualStatus === "normal" ? "selected" : ""}>Vanlig dag</option>
            <option value="holiday" ${manualStatus === "holiday" ? "selected" : ""}>Fridag</option>
            <option value="sick" ${manualStatus === "sick" ? "selected" : ""}>Syk</option>
          </select>
        </label>
      </div>
      <p class="day-mode-note"></p>
      <p class="level-progress-note"></p>
      <div class="actions">
        <button class="primary start-btn" ${started ? "disabled" : ""}>Vekk ${escapeHtml(name)}</button>
      </div>
      <div class="task-grid"></div>
    `;

    const levelProgress = ensureChildLevelProgress(name);
    const levelInfo = resolveLevelInfo(levelProgress.completedTasksTotal);
    const levelBadge = board.querySelector(".badge-level");
    if (levelBadge) levelBadge.textContent = `Nivå ${levelInfo.current.level}: ${levelInfo.current.name}`;
    const levelNote = board.querySelector(".level-progress-note");
    if (levelNote) {
      levelNote.textContent = levelInfo.next
        ? `${levelInfo.total} fullførte oppgaver · ${Math.max(0, levelInfo.next.requiredCompletedTasks - levelInfo.total)} igjen til ${levelInfo.next.name}`
        : `${levelInfo.total} fullførte oppgaver · Toppnivå nådd (${levelInfo.current.name})`;
    }

    const dayModeNote = board.querySelector(".day-mode-note");
    if (dayModeNote) {
      if (effectiveMode.endsWith("_holiday")) {
        dayModeNote.textContent = "I dag er det fridag";
      } else if (effectiveMode === "weekend_sick") {
        dayModeNote.textContent = "Helg og sykedag – ekstra godt jobbet i dag";
      } else if (effectiveMode.endsWith("_sick")) {
        dayModeNote.textContent = "Vi tar det litt rolig i dag";
      } else {
        dayModeNote.textContent = "";
      }
    }

    board.querySelector(".day-status-select")?.addEventListener("change", (event) => {
      setChildDayStatusForToday(name, event.target.value);
    });

    board.querySelector(".start-btn").addEventListener("click", () => startMorning(name));
    board.querySelector(".remove-child-btn").addEventListener("click", () => removeChild(name));
    const taskGrid = board.querySelector(".task-grid");

    if (wildcardEnabled && wildcardTask && wildcardTaskKey && !effectiveMode.endsWith("_holiday")) {
      const wildcardItem = document.createElement("div");
      wildcardItem.className = "task-item";

      const wildcardBtn = document.createElement("button");
      wildcardBtn.className = `task-btn ${wildcardDone ? "done" : ""}`;
      wildcardBtn.disabled = !started;
      wildcardBtn.innerHTML = `
        <div class="task-text">${escapeHtml(wildcardTask.title)}</div>
        ${wildcardDone ? `<small>Fullført · +${session.completedTasks[wildcardTaskKey].points} poeng</small>` : '<small>Bonusoppgave</small>'}
      `;
      wildcardBtn.addEventListener("click", () => toggleWildcardTask(name));

      wildcardItem.appendChild(wildcardBtn);
      taskGrid.appendChild(wildcardItem);
    }
    info.routines.forEach((task, idx) => {
      const details = session.completedTasks[idx];
      const done = !!details;

      const taskItem = document.createElement("div");
      taskItem.className = "task-item";

      const taskBtn = document.createElement("button");
      taskBtn.className = `task-btn ${done ? "done" : ""}`;
      taskBtn.disabled = !started || effectiveMode.endsWith("_holiday");
      taskBtn.innerHTML = `
        <div class="task-text">${escapeHtml(task)}</div>
        ${done ? `<small>${formatDuration(details.durationSec)} · +${details.points} poeng</small>` : ""}
      `;
      taskBtn.addEventListener("click", () => toggleTask(name, idx));

      const removeTaskBtn = document.createElement("button");
      removeTaskBtn.className = "icon-btn remove-task-btn";
      removeTaskBtn.type = "button";
      removeTaskBtn.setAttribute("aria-label", "Fjern oppgave");
      removeTaskBtn.textContent = "✕";
      removeTaskBtn.addEventListener("click", () => removeTask(name, idx));

      taskItem.appendChild(taskBtn);
      taskItem.appendChild(removeTaskBtn);
      taskGrid.appendChild(taskItem);
    });

    const addTaskBtn = document.createElement("button");
    addTaskBtn.className = "task-btn add-task-btn";
    addTaskBtn.type = "button";
    addTaskBtn.innerHTML = '<div class="task-text">Legg til oppgave</div>';
    addTaskBtn.addEventListener("click", () => addTask(name));
    taskGrid.appendChild(addTaskBtn);

    childBoards.appendChild(board);
  });

  if (wildcardStateChanged) saveState();
}

function ensureChildPointAccount(childName) {
  if (!state.pointBank[childName]) {
    state.pointBank[childName] = { earnedTotal: 0, spentTotal: 0, claimedMilestones: [] };
  }
  return state.pointBank[childName];
}

function getSpendablePoints(childName) {
  const account = ensureChildPointAccount(childName);
  return Math.max(0, account.earnedTotal - account.spentTotal);
}

function renderPointsOverview() {
  if (!pointsOverviewEl) return;
  pointsOverviewEl.innerHTML = "";

  Object.keys(state.children).forEach((childName) => {
    const account = ensureChildPointAccount(childName);
    const availablePoints = getSpendablePoints(childName);
    const rewards = state.rewardCatalog.slice().sort((a, b) => a.cost - b.cost);

    const rewardItems = rewards.length
      ? rewards
          .map((reward) => {
            const pct = Math.max(0, Math.min(100, Math.round((availablePoints / Math.max(1, reward.cost)) * 100)));
            return `
              <article class="reward-choice" data-child="${escapeHtml(childName)}" data-reward-id="${escapeHtml(reward.id)}">
                <div class="reward-ring" style="--progress:${pct}%">
                  <span>${availablePoints}/${reward.cost}</span>
                </div>
                <h5>${escapeHtml(reward.title)}</h5>
                <button class="reward-claim-btn ${availablePoints < reward.cost ? "reward-claim-btn--hidden" : ""}" type="button" data-child="${escapeHtml(childName)}" data-reward-id="${escapeHtml(reward.id)}" ${availablePoints < reward.cost ? "disabled aria-hidden='true'" : ""}>Få premie</button>
              </article>
            `;
          })
          .join("")
      : '<p class="note">Ingen premier definert ennå. Legg til premier i Innstillinger.</p>';

    const redemptionItems = state.rewardRedemptions
      .filter((entry) => entry.childName === childName)
      .slice(0, 6)
      .map(
        (entry) =>
          `<li>${escapeHtml(entry.rewardTitle)} <span class="reward-history-cost">−${Number(entry.cost) || 0} poeng</span></li>`
      )
      .join("");

    const card = document.createElement("article");
    card.className = "points-card";
    card.innerHTML = `
      <div class="points-header">
        <h4>${escapeHtml(childName)}</h4>
        <p>Totalpoeng: <strong>${account.earnedTotal}</strong> · Tilgjengelig: <strong>${availablePoints}</strong></p>
      </div>
      <div class="reward-menu reward-menu-rings">${rewardItems}</div>
      <section class="reward-history">
        <h5>Valgte premier</h5>
        <ul>${redemptionItems || '<li class="note">Ingen premier innløst ennå.</li>'}</ul>
      </section>
    `;

    card.querySelectorAll(".reward-claim-btn").forEach((button) => {
      button.addEventListener("click", () => redeemReward(childName, button.dataset.rewardId));
    });

    pointsOverviewEl.appendChild(card);
  });
}

function addChild() {
  const childName = childNameInput.value.trim();
  if (!childName) return;
  if (state.children[childName]) {
    alert("Barn med dette navnet finnes allerede.");
    return;
  }
  state.children[childName] = { age: 0, routines: [] };
  sessions[childName] = createSession(childName);
  ensureChildPointAccount(childName);
  ensureChildLevelProgress(childName);
  childNameInput.value = "";
  saveState();
  renderAll();
}

function removeChild(childName) {
  if (!confirm(`Fjerne ${childName} og all historikk?`)) return;
  delete state.children[childName];
  delete sessions[childName];
  delete state.wildcards[childName];
  delete state.wildcardHistory[childName];
  delete state.dayStatusOverrides[childName];
  delete state.streaks[childName];
  delete state.pointBank[childName];
  delete state.levelProgress[childName];
  state.history = state.history.filter((entry) => entry.childName !== childName);
  saveState();
  renderAll();
}

function addTask(childName) {
  const title = prompt(`Ny oppgave for ${childName}:`);
  if (!title) return;
  const trimmed = title.trim();
  if (!trimmed) return;
  state.children[childName].routines.push(trimmed);
  saveState();
  renderAll();
}

function removeTask(childName, taskIndex) {
  const taskName = state.children[childName].routines[taskIndex];
  if (!confirm(`Fjern oppgaven "${taskName}"?`)) return;

  state.children[childName].routines.splice(taskIndex, 1);
  sessions[childName] = createSession(childName);
  state.history = state.history.map((entry) => {
    if (entry.childName !== childName) return entry;
    return {
      ...entry,
      taskEntries: (entry.taskEntries || []).filter((t) => t.taskName !== taskName),
    };
  });
  saveState();
  renderAll();
}

function startMorning(childName) {
  sessions[childName] = createSession(childName);
  sessions[childName].startedAt = Date.now();
  sessions[childName].lastTaskAt = sessions[childName].startedAt;
  saveState();
  renderBoards();
}

function toggleTask(childName, taskIndex) {
  const session = sessions[childName];
  if (!session.startedAt) return;

  const current = session.completedTasks[taskIndex];
  if (!current) {
    const taskName = state.children[childName].routines[taskIndex] || `Oppgave ${Number(taskIndex) + 1}`;
    completeTask(childName, session, taskIndex, { taskName });

    if (state.soundEnabled) playTaskSound();
  } else {
    delete session.completedTasks[taskIndex];
    session.score -= current.points;

    const remaining = Object.values(session.completedTasks).filter(Boolean);
    session.lastTaskAt = remaining.length ? Math.max(...remaining.map((item) => item.completedAtMs)) : session.startedAt;
  }

  const total = state.children[childName].routines.length;
  const todayKey = getLocalDateKey();
  const effectiveMode = getEffectiveDayMode(todayKey, getChildDayOverride(childName, todayKey));
  const requiredCount = getRequiredRoutineCount(total, effectiveMode);
  const doneCount = countRoutineCompletions(session);
  if (requiredCount > 0 && doneCount >= requiredCount) {
    finishMorning(childName, true);
    return;
  }

  saveState();
  renderBoards();
}

function toggleWildcardTask(childName) {
  const session = sessions[childName];
  if (!session?.startedAt || state.bonusTasksEnabled === false) return;

  const wildcardState = getOrAssignDailyWildcard(childName);
  const wildcardTaskKey = `wildcard:${wildcardState.dateKey}`;
  const current = session.completedTasks[wildcardTaskKey];

  if (!current) {
    completeTask(childName, session, wildcardTaskKey, {
      taskName: `Wildcard: ${wildcardState.task.title}`,
      isWildcard: true,
    });
    if (state.soundEnabled) playTaskSound();
  } else {
    delete session.completedTasks[wildcardTaskKey];
    session.score -= current.points;
  }

  const remaining = Object.values(session.completedTasks).filter(Boolean);
  session.lastTaskAt = remaining.length ? Math.max(...remaining.map((item) => item.completedAtMs)) : session.startedAt;

  saveState();
  renderBoards();
}

function getAverageDurationForTask(childName, taskName) {
  const entries = state.history.filter((entry) => entry.childName === childName);
  const samples = [];
  entries.forEach((entry) => {
    (entry.taskEntries || []).forEach((task) => {
      if (task.taskName === taskName && !task.isWildcard && Number.isFinite(task.durationSec)) {
        samples.push(task.durationSec);
      }
    });
  });
  if (!samples.length) return null;
  return Math.round(samples.reduce((sum, sec) => sum + sec, 0) / samples.length);
}

function completeTask(childName, session, taskKey, extra = {}) {
  const now = Date.now();
  const segmentStart = session.lastTaskAt || session.startedAt;
  const elapsedSec = Math.max(1, Math.round((now - segmentStart) / 1000));

  const speedFactor = Math.max(0, 1 - elapsedSec / 480);
  const bonus = Math.round(state.scoring.maxBonus * speedFactor);
  const avgSec = extra.taskName && !extra.isWildcard ? getAverageDurationForTask(childName, extra.taskName) : null;
  const efficiencyFactor = avgSec && elapsedSec < avgSec ? (avgSec - elapsedSec) / Math.max(1, avgSec) : 0;
  const efficiencyBonus = Math.round(state.scoring.maxBonus * efficiencyFactor);
  const points = Math.max(state.scoring.basePoints, state.scoring.basePoints + bonus + efficiencyBonus);

  session.completedTasks[taskKey] = { points, durationSec: elapsedSec, completedAtMs: now, ...extra };
  session.score += points;
  session.lastTaskAt = now;
}

function countRoutineCompletions(session) {
  return Object.keys(session.completedTasks).filter((key) => Number.isInteger(Number(key))).length;
}

function celebrateMilestonesIfNeeded(childName, previousTotal, nextTotal) {
  const account = ensureChildPointAccount(childName);
  const reached = POINT_MILESTONES.filter((point) => previousTotal < point && nextTotal >= point && !account.claimedMilestones.includes(point));
  if (!reached.length) return;
  account.claimedMilestones = [...account.claimedMilestones, ...reached].sort((a, b) => a - b);
  alert(`🎉 ${childName} nådde milepæl: ${reached.join(", ")} poeng!`);
}

function redeemReward(childName, rewardId) {
  const reward = state.rewardCatalog.find((item) => item.id === rewardId);
  if (!reward) return;

  const available = getSpendablePoints(childName);
  if (available < reward.cost) return;
  if (!confirm(`${childName} vil løse inn "${reward.title}" for ${reward.cost} poeng. Fortsette?`)) return;

  const account = ensureChildPointAccount(childName);
  account.spentTotal += reward.cost;
  state.rewardRedemptions = [
    { childName, rewardId: reward.id, rewardTitle: reward.title, cost: reward.cost, redeemedAt: new Date().toISOString() },
    ...state.rewardRedemptions,
  ].slice(0, 200);

  saveState();
  renderPointsOverview();
}

function finishMorning(childName, automatic = false) {
  const session = sessions[childName];
  const routines = state.children[childName].routines;
  const total = routines.length;
  const todayKey = getLocalDateKey();
  const effectiveMode = getEffectiveDayMode(todayKey, getChildDayOverride(childName, todayKey));
  const requiredCount = getRequiredRoutineCount(total, effectiveMode);
  const doneCount = countRoutineCompletions(session);
  if (!session.startedAt || requiredCount === 0 || doneCount < requiredCount) return;

  const finishedAt = Date.now();
  session.score += 20;
  session.score += getDayModeBonus(effectiveMode);
  const account = ensureChildPointAccount(childName);
  const previousTotal = account.earnedTotal;
  account.earnedTotal += session.score;
  celebrateMilestonesIfNeeded(childName, previousTotal, account.earnedTotal);

  const levelProgress = ensureChildLevelProgress(childName);
  const taskCompletionCount = Object.values(session.completedTasks).filter(Boolean).length;
  levelProgress.completedTasksTotal += taskCompletionCount;
  updateChildStreakOnCompletion(childName, todayKey);

  const taskEntries = Object.entries(session.completedTasks).map(([idx, details]) => {
    const taskName = Number.isInteger(Number(idx))
      ? routines[Number(idx)] || `Oppgave ${Number(idx) + 1}`
      : details.taskName || "Bonusoppgave";
    return {
      taskName,
      durationSec: details.durationSec,
      points: details.points,
      isWildcard: !!details.isWildcard,
    };
  });

  state.history = [
    {
      childName,
      score: session.score,
      durationSec: Math.round((finishedAt - session.startedAt) / 1000),
      completedAt: new Date(finishedAt).toISOString(),
      taskEntries,
    },
    ...state.history,
  ].slice(0, 100);

  if (state.soundEnabled) playCompletionJingle();
  alert(`${automatic ? "Alle oppgavene er fullført!" : "Bra jobbet!"}\n${childName} fikk ${session.score} poeng.`);
  sessions[childName] = createSession(childName);
  saveState();
  renderAll();
}

function renderStats() {
  weeklyStatsEl.innerHTML = "";

  Object.keys(state.children).forEach((name) => {
    const entries = state.history.filter((h) => h.childName === name);

    const taskMap = new Map();
    state.children[name].routines.forEach((task) => {
      taskMap.set(task, { totalSec: 0, count: 0 });
    });

    entries.forEach((entry) => {
      (entry.taskEntries || []).forEach((t) => {
        if (!taskMap.has(t.taskName)) taskMap.set(t.taskName, { totalSec: 0, count: 0 });
        const row = taskMap.get(t.taskName);
        row.totalSec += t.durationSec;
        row.count += 1;
      });
    });

    const averages = Array.from(taskMap.entries()).map(([task, data]) => ({
      task,
      avgSec: data.count ? Math.round(data.totalSec / data.count) : 0,
    }));
    const maxAvg = Math.max(1, ...averages.map((x) => x.avgSec));

    const graphBars = averages
      .map((row) => `
        <div class="graph-row">
          <span class="graph-label">${escapeHtml(row.task)}</span>
          <div class="graph-track"><div class="graph-fill" style="width:${Math.max(3, Math.round((row.avgSec / maxAvg) * 100))}%"></div></div>
          <span class="graph-value">${row.avgSec ? formatDuration(row.avgSec) : "-"}</span>
        </div>
      `)
      .join("");

    const card = document.createElement("div");
    card.className = "stat-card stat-card-extended";
    card.innerHTML = `
      <h4>${escapeHtml(name)}</h4>
      <h5>Tid per oppgave (snitt)</h5>
      <div class="graph-list">${graphBars || '<p class="note">Ingen oppgaver ennå.</p>'}</div>
    `;
    weeklyStatsEl.appendChild(card);
  });
}

function startTimerLoop() {
  timerId = setInterval(renderBoards, 1000);
}

function formatElapsed(startedAt) {
  if (!startedAt) return "00:00";
  const totalSec = Math.floor((Date.now() - startedAt) / 1000);
  return formatDuration(totalSec);
}

function formatDuration(totalSec) {
  const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function getLocalDateKey(ts = Date.now()) {
  const date = new Date(ts);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateKeyToDate(dateKey) {
  const [y, m, d] = String(dateKey).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function getBaseDayType(dateKey) {
  const day = dateKeyToDate(dateKey).getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
}

function getChildDayOverride(childName, dateKey) {
  const status = state.dayStatusOverrides?.[childName]?.[dateKey];
  return status === "holiday" || status === "sick" || status === "normal" ? status : "normal";
}

function getEffectiveDayMode(dateKey, manualStatus) {
  const base = getBaseDayType(dateKey);
  return `${base}_${manualStatus || "normal"}`;
}

function getRequiredRoutineCount(totalRoutines, effectiveMode) {
  if (effectiveMode.endsWith("_holiday")) return 0;
  if (effectiveMode.endsWith("_sick")) return Math.max(1, Math.ceil(totalRoutines * 0.5));
  if (effectiveMode === "weekend_normal") return Math.max(1, Math.ceil(totalRoutines * 0.7));
  return totalRoutines;
}

function getDayModeBonus(effectiveMode) {
  if (effectiveMode === "weekend_sick") return DAY_BONUSES.weekendSickBonus;
  if (effectiveMode.endsWith("_sick")) return DAY_BONUSES.sickBonus;
  return 0;
}

function ensureChildStreak(childName) {
  if (!state.streaks[childName]) state.streaks[childName] = { count: 0, lastCompletedDate: "" };
  return state.streaks[childName];
}

function nextDateKey(dateKey) {
  const date = dateKeyToDate(dateKey);
  date.setDate(date.getDate() + 1);
  return getLocalDateKey(date.getTime());
}

function dayIsProtectedForStreak(childName, dateKey) {
  const manual = getChildDayOverride(childName, dateKey);
  return manual === "holiday" || manual === "sick";
}

function canBridgeStreak(childName, fromDateKey, toDateKey) {
  let cursor = nextDateKey(fromDateKey);
  while (cursor < toDateKey) {
    if (!dayIsProtectedForStreak(childName, cursor)) return false;
    cursor = nextDateKey(cursor);
  }
  return true;
}

function updateChildStreakOnCompletion(childName, completionDateKey) {
  const streak = ensureChildStreak(childName);
  if (!streak.lastCompletedDate) {
    streak.count = 1;
    streak.lastCompletedDate = completionDateKey;
    return;
  }

  const expectedNext = nextDateKey(streak.lastCompletedDate);
  if (completionDateKey === streak.lastCompletedDate) return;

  if (completionDateKey === expectedNext || canBridgeStreak(childName, streak.lastCompletedDate, completionDateKey)) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }
  streak.lastCompletedDate = completionDateKey;
}

function setChildDayStatusForToday(childName, status) {
  const dateKey = getLocalDateKey();
  if (!state.dayStatusOverrides[childName]) state.dayStatusOverrides[childName] = {};

  if (status === "normal") {
    delete state.dayStatusOverrides[childName][dateKey];
  } else {
    state.dayStatusOverrides[childName][dateKey] = status;
  }

  saveState();
  renderBoards();
}

function getUsedWildcardIdsForDate(dateKey, excludeChildName) {
  return new Set(
    Object.entries(state.wildcards || {})
      .filter(([name, row]) => name !== excludeChildName && row?.dateKey === dateKey && row?.taskId)
      .map(([, row]) => row.taskId)
  );
}

function pickWildcardTask(childName, dateKey, usedToday = new Set()) {
  const recent = state.wildcardHistory[childName] || [];
  const recentSet = new Set(recent.slice(-WILDCARD_REPEAT_GUARD));
  const catalog = wildcardTasks.length ? wildcardTasks : DEFAULT_WILDCARD_TASKS;

  const unusedToday = catalog.filter((task) => !usedToday.has(task.id));
  const candidates = unusedToday.filter((task) => !recentSet.has(task.id));
  const pool = candidates.length ? candidates : (unusedToday.length ? unusedToday : catalog);

  const seed = `${childName}:${dateKey}`;
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

function getOrAssignDailyWildcard(childName) {
  const dateKey = getLocalDateKey();
  const usedToday = getUsedWildcardIdsForDate(dateKey, childName);
  const existing = state.wildcards[childName];

  if (existing?.dateKey === dateKey && existing.taskId) {
    const conflict = usedToday.has(existing.taskId);
    if (!conflict || (wildcardTasks.length || DEFAULT_WILDCARD_TASKS.length) <= 1) {
      const match = wildcardTasks.find((task) => task.id === existing.taskId) || wildcardTasks[0] || DEFAULT_WILDCARD_TASKS[0];
      return { task: match, dateKey, didAssign: false };
    }
  }

  const task = pickWildcardTask(childName, dateKey, usedToday);
  state.wildcards[childName] = { dateKey, taskId: task.id };
  const history = state.wildcardHistory[childName] || [];
  state.wildcardHistory[childName] = [...history, task.id].slice(-WILDCARD_HISTORY_LIMIT);
  return { task, dateKey, didAssign: true };
}

function createAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playTaskSound() {
  const ctx = createAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [740, 932, 1175].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now + i * 0.06);
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.05, now + i * 0.06 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.13);
  });
}

function playCompletionJingle() {
  const ctx = createAudioContext();
  if (!ctx) return;

  const melody = [392, 523, 659, 784, 1046, 1318];
  const now = ctx.currentTime;
  melody.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.09, now + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.24);
  });
}

openParentModeBtn.addEventListener("click", () => {
  soundToggle.checked = !!state.soundEnabled;
  if (bonusTasksToggle) bonusTasksToggle.checked = state.bonusTasksEnabled !== false;
  basePoints.value = state.scoring.basePoints;
  bonusPoints.value = state.scoring.maxBonus;
  syncScoreDisplays();
  renderRewardSettings();
  parentDialog.showModal();
});

function buildRewardId(title) {
  const normalized = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const base = normalized || `reward-${Date.now()}`;
  const exists = new Set((state.rewardCatalog || []).map((item) => item.id));
  if (!exists.has(base)) return base;
  let n = 2;
  while (exists.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function renderRewardSettings() {
  if (!rewardSettingsList) return;
  rewardSettingsList.innerHTML = "";

  state.rewardCatalog
    .slice()
    .sort((a, b) => a.cost - b.cost)
    .forEach((reward) => {
      const row = document.createElement("div");
      row.className = "reward-settings-item";
      row.innerHTML = `
        <span>${escapeHtml(reward.title)}</span>
        <span>${reward.cost} poeng</span>
        <button class="reward-remove-btn" type="button" aria-label="Fjern premie">✕</button>
      `;
      row.querySelector(".reward-remove-btn")?.addEventListener("click", () => {
        state.rewardCatalog = state.rewardCatalog.filter((item) => item.id !== reward.id);
        saveState();
        renderRewardSettings();
        renderPointsOverview();
      });
      rewardSettingsList.appendChild(row);
    });
}

function addRewardFromSettings() {
  const title = rewardTitleInput?.value?.trim() || "";
  const cost = clampNumber(rewardCostInput?.value, 1, 100000, 100);
  if (!title) return;

  state.rewardCatalog = sanitizeRewardCatalog([
    ...state.rewardCatalog,
    { id: buildRewardId(title), title, cost },
  ]);

  if (rewardTitleInput) rewardTitleInput.value = "";
  if (rewardCostInput) rewardCostInput.value = "";

  saveState();
  renderRewardSettings();
  renderPointsOverview();
}

function syncScoreDisplays() {
  if (basePointsDisplay) basePointsDisplay.textContent = String(basePoints.value || state.scoring.basePoints);
  if (bonusPointsDisplay) bonusPointsDisplay.textContent = String(bonusPoints.value || state.scoring.maxBonus);
}

function changeScoreValue(target, delta) {
  if (target === "base") {
    basePoints.value = clampNumber(Number(basePoints.value || state.scoring.basePoints) + delta, 1, 50, 10);
  } else {
    bonusPoints.value = clampNumber(Number(bonusPoints.value || state.scoring.maxBonus) + delta, 0, 20, 5);
  }
  syncScoreDisplays();
}

function saveSettingsFromDialog() {
  state.soundEnabled = soundToggle.checked;
  state.bonusTasksEnabled = bonusTasksToggle ? bonusTasksToggle.checked : true;
  state.scoring.basePoints = clampNumber(basePoints.value, 1, 50, 10);
  state.scoring.maxBonus = clampNumber(bonusPoints.value, 0, 20, 5);
  saveState();
}

closeSettingsX?.addEventListener("click", () => {
  saveSettingsFromDialog();
  parentDialog.close();
});

function setupAuthUI() {
  const getEmailCredentials = () => ({
    email: authEmailInput?.value?.trim() || "",
    password: authPasswordInput?.value || "",
  });

  const submitEmailLogin = () => {
    const { email, password } = getEmailCredentials();
    cloud.signInWithEmail(email, password);
  };

  const submitEmailCreate = () => {
    const { email, password } = getEmailCredentials();
    cloud.createAccountWithEmail(email, password);
  };

  authEmailInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitEmailLogin();
  });
  authPasswordInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitEmailLogin();
  });

  authGuestBtn?.addEventListener("click", () => {
    setSignedInUI({ uid: "guest-local" });
    updateAuthStatus("Lokal modus uten synk er aktiv.");
  });

  authEmailSignInBtn?.addEventListener("click", submitEmailLogin);
  authEmailCreateBtn?.addEventListener("click", submitEmailCreate);
  settingsLogout?.addEventListener("click", async () => {
    await cloud.signOut();
    parentDialog.close();
  });

  basePlus?.addEventListener("click", () => changeScoreValue("base", 1));
  baseMinus?.addEventListener("click", () => changeScoreValue("base", -1));
  bonusPlus?.addEventListener("click", () => changeScoreValue("bonus", 1));
  bonusMinus?.addEventListener("click", () => changeScoreValue("bonus", -1));
  addRewardBtn?.addEventListener("click", addRewardFromSettings);
  rewardTitleInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addRewardFromSettings();
  });
  rewardCostInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addRewardFromSettings();
  });

  addChildBtn?.addEventListener("click", addChild);
  childNameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addChild();
  });
}

function updateAuthStatus(text) {
  if (authStatus) authStatus.textContent = text;
}

function setSignedInUI(user) {
  const signedIn = !!user;
  if (authScreen) {
    authScreen.hidden = signedIn;
    authScreen.style.display = signedIn ? "none" : "grid";
  }
  if (appShell) {
    appShell.hidden = !signedIn;
    appShell.style.display = signedIn ? "block" : "none";
  }
}

function createCloudAdapter() {
  let firebaseApp = null;
  let auth = null;
  let db = null;
  let currentUser = null;
  let unsubscribeProfile = null;
  let pendingPushState = null;
  let pushInFlight = false;

  function normalizeFirebaseConfig(rawCfg) {
    if (!rawCfg || typeof rawCfg !== "object") return null;

    const cfg = { ...rawCfg };
    const clean = (value) => String(value || "").trim();

    cfg.apiKey = clean(cfg.apiKey);
    cfg.projectId = clean(cfg.projectId);
    cfg.appId = clean(cfg.appId);

    let authDomain = clean(cfg.authDomain);
    if (authDomain) {
      authDomain = authDomain
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "")
        .trim();
    }
    if (!authDomain && cfg.projectId) {
      authDomain = `${cfg.projectId}.firebaseapp.com`;
    }
    cfg.authDomain = authDomain;

    if (!cfg.apiKey || !cfg.projectId || !cfg.appId || !cfg.authDomain) return null;
    return cfg;
  }

  function getConfig() {
    return normalizeFirebaseConfig(window.MORGENHELT_FIREBASE_CONFIG);
  }

  function isEnabled() {
    return !!(window.firebase && getConfig());
  }

  function buildStateFromRemote(remote) {
    return {
      ...structuredClone(DEFAULT_STATE),
      ...remote,
      scoring: { ...structuredClone(DEFAULT_STATE).scoring, ...remote.scoring },
      children: sanitizeChildren(remote.children),
      history: Array.isArray(remote.history) ? remote.history : [],
      activeSessions: sanitizeActiveSessions(remote.activeSessions, sanitizeChildren(remote.children)),
      wildcards: sanitizeWildcards(remote.wildcards, sanitizeChildren(remote.children)),
      wildcardHistory: sanitizeWildcardHistory(remote.wildcardHistory, sanitizeChildren(remote.children)),
      dayStatusOverrides: sanitizeDayStatusOverrides(remote.dayStatusOverrides, sanitizeChildren(remote.children)),
      streaks: sanitizeStreaks(remote.streaks, sanitizeChildren(remote.children)),
      pointBank: sanitizePointBank(remote.pointBank, sanitizeChildren(remote.children)),
      levelProgress: sanitizeLevelProgress(remote.levelProgress, sanitizeChildren(remote.children)),
      rewardCatalog: sanitizeRewardCatalog(remote.rewardCatalog),
      rewardRedemptions: Array.isArray(remote.rewardRedemptions) ? remote.rewardRedemptions : [],
      meta: { updatedAt: Number(remote?.meta?.updatedAt) || 0 },
    };
  }

  function applyRemoteState(remote) {
    const nextState = buildStateFromRemote(remote);
    const remoteUpdatedAt = Number(nextState?.meta?.updatedAt) || 0;
    const localUpdatedAt = Number(state?.meta?.updatedAt) || 0;
    if (remoteUpdatedAt && localUpdatedAt && remoteUpdatedAt < localUpdatedAt) return;
    if (JSON.stringify(nextState) === JSON.stringify(state)) return;

    state = nextState;
    Object.keys(sessions).forEach((key) => delete sessions[key]);
    Object.assign(sessions, createAllSessions());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
  }

  function ensureFirebase() {
    if (!isEnabled()) return false;
    if (firebaseApp) return true;

    firebaseApp = firebase.initializeApp(getConfig());
    auth = firebase.auth(firebaseApp);
    db = firebase.firestore(firebaseApp);
    return true;
  }

  function setProfileSubscription(uid) {
    if (!db || !uid) return;
    unsubscribeProfile?.();
    unsubscribeProfile = db.collection("profiles").doc(uid).onSnapshot(
      { includeMetadataChanges: true },
      (snap) => {
        if (!snap.exists) return;
        const payload = snap.data()?.state;
        if (!payload) return;
        applyRemoteState(payload);
      },
      () => {}
    );
  }


  function enqueuePush(nextState) {
    pendingPushState = structuredClone(nextState);
    void flushPush();
  }

  async function flushPush() {
    if (pushInFlight || !pendingPushState || !currentUser || !db) return;

    pushInFlight = true;
    const payload = pendingPushState;
    pendingPushState = null;

    try {
      await db.collection("profiles").doc(currentUser.uid).set(
        {
          state: payload,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch {
      pendingPushState = payload;
      setTimeout(() => {
        void flushPush();
      }, 1500);
    } finally {
      pushInFlight = false;
      if (pendingPushState) void flushPush();
    }
  }

  function init() {
    if (!isEnabled()) {
      setSignedInUI(null);
      updateAuthStatus("");
      return;
    }

    ensureFirebase();

    const cfg = getConfig();
    if (cfg?.authDomain && cfg.authDomain.includes("/")) {
      updateAuthStatus("Firebase authDomain ser feil ut. Bruk kun domenenavn uten https:// og sti.");
    }

    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});

    auth.getRedirectResult()
      .then(async (result) => {
        if (!result?.user) return;
        currentUser = result.user;
        setSignedInUI(result.user);
        updateAuthStatus(`Logget inn som ${result.user.email || result.user.displayName || "bruker"}.`);
        setProfileSubscription(result.user.uid);
        try {
          await pullState();
        } finally {
          void flushPush();
        }
      })
      .catch((err) => {
        updateAuthStatus(`Innlogging feilet: ${describeAuthError(err)}`);
      });

    auth.onAuthStateChanged(async (user) => {
      currentUser = user;
      setSignedInUI(user);
      if (!user) {
        unsubscribeProfile?.();
        unsubscribeProfile = null;
        updateAuthStatus("");
        return;
      }

      updateAuthStatus(`Logget inn som ${user.email || user.displayName || "bruker"}.`);
      setProfileSubscription(user.uid);
      try {
        await pullState();
      } finally {
        void flushPush();
      }
    });
  }

  function providerFor(type) {
    if (type === "google") return new firebase.auth.GoogleAuthProvider();
    if (type === "facebook") return new firebase.auth.FacebookAuthProvider();
    return null;
  }

  function getAuthDomainHint() {
    const cfg = getConfig() || {};
    const runtimeHost = window.location.host || "ukjent-host";
    const authDomain = cfg.authDomain || "ukjent-authDomain";
    const projectId = cfg.projectId || "ukjent-projectId";
    return `Runtime-host: ${runtimeHost}. Config authDomain: ${authDomain} (project: ${projectId}).`;
  }

  function describeAuthError(err) {
    const code = err?.code || "";
    if (code === "auth/unauthorized-domain") {
      return `Dette domenet er ikke autorisert i Firebase Auth. ${getAuthDomainHint()} Sjekk at korrekt Firebase-prosjekt brukes på denne enheten og at hosten (inkl. www/ikke-www) er lagt til i Authorized domains.`;
    }
    if (code === "auth/operation-not-allowed") {
      return "Google-innlogging er ikke aktivert i Firebase Console. Aktiver Google-provideren under Authentication → Sign-in method.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Innlogging ble avbrutt fordi popup-vinduet ble lukket før fullføring.";
    }
    if (code === "auth/network-request-failed") {
      return "Nettverksfeil under innlogging. Sjekk internett og prøv igjen.";
    }
    return err?.message || "ukjent feil";
  }

  function shouldPreferRedirect() {
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
    return isIOS || isSafari;
  }

  async function signIn(providerType) {
    if (!ensureFirebase()) {
      alert("Innlogging er ikke tilgjengelig akkurat nå. Sjekk firebase-config.js.");
      return;
    }

    const provider = providerFor(providerType);
    if (!provider) return;

    if (shouldPreferRedirect()) {
      try {
        updateAuthStatus("Sender til innlogging…");
        await auth.signInWithRedirect(provider);
        return;
      } catch (redirectErr) {
        alert(`Innlogging feilet: ${describeAuthError(redirectErr)}`);
        return;
      }
    }

    try {
      await auth.signInWithPopup(provider);
      setSignedInUI({ uid: "pending" });
    } catch (err) {
      const fallbackToRedirect = [
        "auth/popup-blocked",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment",
      ].includes(err?.code);

      if (fallbackToRedirect) {
        try {
          updateAuthStatus("Sender til innlogging…");
        await auth.signInWithRedirect(provider);
          return;
        } catch (redirectErr) {
          alert(`Innlogging feilet: ${describeAuthError(redirectErr)}`);
          return;
        }
      }

      alert(`Innlogging feilet: ${describeAuthError(err)}`);
    }
  }

  async function signInWithEmail(email, password) {
    if (!ensureFirebase()) {
      alert("Innlogging er ikke tilgjengelig akkurat nå.");
      return;
    }
    if (!email || password.length < 6) {
      alert("Fyll inn e-post og passord (minst 6 tegn).");
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
      setSignedInUI({ uid: "pending" });
    } catch (err) {
      if (err?.code === "auth/user-not-found") {
        alert("Ingen konto funnet for e-posten. Trykk 'Opprett konto' for å registrere deg.");
        return;
      }
      alert(`Innlogging feilet: ${describeAuthError(err)}`);
    }
  }

  async function createAccountWithEmail(email, password) {
    if (!ensureFirebase()) {
      alert("Innlogging er ikke tilgjengelig akkurat nå.");
      return;
    }
    if (!email || password.length < 6) {
      alert("Fyll inn e-post og passord (minst 6 tegn).");
      return;
    }

    try {
      await auth.createUserWithEmailAndPassword(email, password);
      setSignedInUI({ uid: "pending" });
    } catch (err) {
      if (err?.code === "auth/email-already-in-use") {
        alert("Konto finnes allerede. Bruk 'Logg inn med e-post'.");
        return;
      }
      alert(`Kunne ikke opprette konto: ${describeAuthError(err)}`);
    }
  }

  async function signOut() {
    if (!auth) return;
    await auth.signOut();
    setSignedInUI(null);
  }

  function pushState(nextState) {
    enqueuePush(nextState);
  }

  async function pullState() {
    if (!currentUser || !db) return;

    let snap = null;
    try {
      snap = await db.collection("profiles").doc(currentUser.uid).get({ source: "server" });
    } catch {
      snap = await db.collection("profiles").doc(currentUser.uid).get();
    }

    if (!snap.exists) {
      pushState(state);
      return;
    }

    const payload = snap.data()?.state;
    if (!payload) return;

    applyRemoteState(payload);
  }

  return { init, signIn, signInWithEmail, createAccountWithEmail, signOut, pushState };
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

window.addEventListener(
  "pointerdown",
  () => {
    const ctx = createAudioContext();
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
  },
  { once: true }
);

window.addEventListener("beforeunload", saveState);
