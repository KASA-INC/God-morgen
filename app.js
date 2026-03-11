const DEFAULT_STATE = {
  soundEnabled: true,
  scoring: { basePoints: 10, maxBonus: 5 },
  children: {},
  history: [],
  meta: { updatedAt: 0 },
};

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
const authGoogleBtn = document.getElementById("authGoogle");
const authFacebookBtn = document.getElementById("authFacebook");

const childBoards = document.getElementById("childBoards");
const weeklyStatsEl = document.getElementById("weeklyStats");
const addChildBtn = document.getElementById("addChildBtn");
const childNameInput = document.getElementById("newChildName");
const emptyState = document.getElementById("emptyState");

const openParentModeBtn = document.getElementById("openParentMode");

const parentDialog = document.getElementById("parentDialog");
const parentSettings = document.getElementById("parentSettings");
const closeSettingsX = document.getElementById("closeSettingsX");
const soundToggle = document.getElementById("soundToggle");
const basePoints = document.getElementById("basePoints");
const bonusPoints = document.getElementById("bonusPoints");
const basePlus = document.getElementById("basePlus");
const baseMinus = document.getElementById("baseMinus");
const bonusPlus = document.getElementById("bonusPlus");
const bonusMinus = document.getElementById("bonusMinus");
const basePointsDisplay = document.getElementById("basePointsDisplay");
const bonusPointsDisplay = document.getElementById("bonusPointsDisplay");
const settingsLogout = document.getElementById("settingsLogout");

const cloud = createCloudAdapter();

renderAll();
startTimerLoop();
registerServiceWorker();
setupAuthUI();
cloud.init();

function createAllSessions() {
  return Object.fromEntries(Object.keys(state.children).map((name) => [name, createSession(name)]));
}

function createSession(childName) {
  return { childName, startedAt: null, lastTaskAt: null, completedTasks: {}, score: 0 };
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
      meta: { updatedAt: Number(parsed?.meta?.updatedAt) || 0 },
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  state.meta = { updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  cloud.pushState(state);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

function renderAll() {
  renderBoards();
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

  Object.entries(state.children).forEach(([name, info]) => {
    const session = sessions[name] || createSession(name);
    sessions[name] = session;
    const doneCount = Object.values(session.completedTasks).filter(Boolean).length;
    const total = info.routines.length;
    const started = !!session.startedAt;
    const progress = total ? Math.round((doneCount / total) * 100) : 0;

    const board = document.createElement("section");
    board.className = "child-board";
    board.innerHTML = `
      <div class="child-head">
        <h3>${escapeHtml(name)}</h3>
        <div class="badges">
          <span class="badge badge-clock">${formatElapsed(session.startedAt)}</span>
          <span class="badge badge-score"><span class="score-star">★</span> <span class="score-value">${session.score}</span></span>
        </div>
        <button class="icon-btn remove-child-btn" type="button" aria-label="Fjern barn">✕</button>
      </div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p>${doneCount} av ${total} fullført</p>
      <div class="actions">
        <button class="primary start-btn" ${started ? "disabled" : ""}>Vekk ${escapeHtml(name)}</button>
        <button class="success finish-btn" ${!started || doneCount !== total ? "disabled" : ""}>Fullfør</button>
      </div>
      <div class="task-grid"></div>
    `;

    board.querySelector(".start-btn").addEventListener("click", () => startMorning(name));
    board.querySelector(".finish-btn").addEventListener("click", () => finishMorning(name));
    board.querySelector(".remove-child-btn").addEventListener("click", () => removeChild(name));

    const taskGrid = board.querySelector(".task-grid");
    info.routines.forEach((task, idx) => {
      const details = session.completedTasks[idx];
      const done = !!details;

      const taskItem = document.createElement("div");
      taskItem.className = "task-item";

      const taskBtn = document.createElement("button");
      taskBtn.className = `task-btn ${done ? "done" : ""}`;
      taskBtn.disabled = !started;
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
  childNameInput.value = "";
  saveState();
  renderAll();
}

function removeChild(childName) {
  if (!confirm(`Fjerne ${childName} og all historikk?`)) return;
  delete state.children[childName];
  delete sessions[childName];
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
  renderBoards();
}

function toggleTask(childName, taskIndex) {
  const session = sessions[childName];
  if (!session.startedAt) return;

  const current = session.completedTasks[taskIndex];
  if (!current) {
    const now = Date.now();
    const segmentStart = session.lastTaskAt || session.startedAt;
    const elapsedSec = Math.max(1, Math.round((now - segmentStart) / 1000));

    const speedFactor = Math.max(0, 1 - elapsedSec / 480);
    const bonus = Math.round(state.scoring.maxBonus * speedFactor);
    const points = Math.max(state.scoring.basePoints, state.scoring.basePoints + bonus);

    session.completedTasks[taskIndex] = { points, durationSec: elapsedSec, completedAtMs: now };
    session.score += points;
    session.lastTaskAt = now;

    if (state.soundEnabled) playTaskSound();
  } else {
    delete session.completedTasks[taskIndex];
    session.score -= current.points;

    const remaining = Object.values(session.completedTasks).filter(Boolean);
    session.lastTaskAt = remaining.length ? Math.max(...remaining.map((item) => item.completedAtMs)) : session.startedAt;
  }

  const total = state.children[childName].routines.length;
  const doneCount = Object.values(session.completedTasks).filter(Boolean).length;
  if (total && doneCount === total) {
    finishMorning(childName, true);
    return;
  }

  renderBoards();
}

function finishMorning(childName, automatic = false) {
  const session = sessions[childName];
  const routines = state.children[childName].routines;
  const total = routines.length;
  const doneCount = Object.values(session.completedTasks).filter(Boolean).length;
  if (!session.startedAt || doneCount !== total || total === 0) return;

  const finishedAt = Date.now();
  session.score += 20;

  const taskEntries = Object.entries(session.completedTasks).map(([idx, details]) => ({
    taskName: routines[Number(idx)] || `Oppgave ${Number(idx) + 1}`,
    durationSec: details.durationSec,
    points: details.points,
  }));

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
    const bestScore = entries.length ? Math.max(...entries.map((x) => x.score)) : 0;
    const fastest = entries.length ? Math.min(...entries.map((x) => x.durationSec)) : null;

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
      <p>Rekorddag: ${bestScore} poeng</p>
      <p>Raskeste morgen: ${fastest ? formatDuration(fastest) : "-"}</p>
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
  basePoints.value = state.scoring.basePoints;
  bonusPoints.value = state.scoring.maxBonus;
  syncScoreDisplays();
  parentDialog.showModal();
});

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
  state.scoring.basePoints = clampNumber(basePoints.value, 1, 50, 10);
  state.scoring.maxBonus = clampNumber(bonusPoints.value, 0, 20, 5);
  saveState();
}

closeSettingsX?.addEventListener("click", () => {
  saveSettingsFromDialog();
  parentDialog.close();
});

function setupAuthUI() {
  const submitEmailLogin = () => {
    const email = authEmailInput?.value?.trim() || "";
    const password = authPasswordInput?.value || "";
    cloud.signInWithEmail(email, password);
  };

  authEmailInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitEmailLogin();
  });
  authPasswordInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitEmailLogin();
  });

  authGoogleBtn?.addEventListener("click", () => cloud.signIn("google"));
  authFacebookBtn?.addEventListener("click", () => cloud.signIn("facebook"));

  settingsLogout?.addEventListener("click", async () => {
    await cloud.signOut();
    parentDialog.close();
  });

  basePlus?.addEventListener("click", () => changeScoreValue("base", 1));
  baseMinus?.addEventListener("click", () => changeScoreValue("base", -1));
  bonusPlus?.addEventListener("click", () => changeScoreValue("bonus", 1));
  bonusMinus?.addEventListener("click", () => changeScoreValue("bonus", -1));

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

  function getConfig() {
    const cfg = window.MORGENHELT_FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || !cfg.projectId || !cfg.appId || !cfg.authDomain) return null;
    return cfg;
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
      meta: { updatedAt: Number(remote?.meta?.updatedAt) || 0 },
    };
  }

  function applyRemoteState(remote) {
    const nextState = buildStateFromRemote(remote);
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

  function init() {
    if (!isEnabled()) {
      setSignedInUI(null);
      updateAuthStatus("");
      return;
    }

    ensureFirebase();

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
      await pullState();
    });
  }

  function providerFor(type) {
    if (type === "google") return new firebase.auth.GoogleAuthProvider();
    if (type === "facebook") return new firebase.auth.FacebookAuthProvider();
    return null;
  }

  async function signIn(providerType) {
    if (!ensureFirebase()) {
      alert("Innlogging er ikke tilgjengelig akkurat nå.");
      return;
    }

    const provider = providerFor(providerType);
    if (!provider) return;

    try {
      await auth.signInWithPopup(provider);
      setSignedInUI({ uid: "pending" });
    } catch (err) {
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/cancelled-popup-request") {
        await auth.signInWithRedirect(provider);
        return;
      }
      alert(`Innlogging feilet: ${err?.message || "ukjent feil"}`);
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
      if (err?.code === "auth/user-not-found" || err?.code === "auth/invalid-credential") {
        try {
          await auth.createUserWithEmailAndPassword(email, password);
          setSignedInUI({ uid: "pending" });
          return;
        } catch (createErr) {
          alert(`Innlogging feilet: ${createErr?.message || "ukjent feil"}`);
          return;
        }
      }
      alert(`Innlogging feilet: ${err?.message || "ukjent feil"}`);
    }
  }

  async function signOut() {
    if (!auth) return;
    await auth.signOut();
    setSignedInUI(null);
  }

  async function pushState(nextState) {
    if (!currentUser || !db) return;
    await db.collection("profiles").doc(currentUser.uid).set(
      {
        state: nextState,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  async function pullState() {
    if (!currentUser || !db) return;

    const snap = await db.collection("profiles").doc(currentUser.uid).get();
    if (!snap.exists) {
      await pushState(state);
      return;
    }

    const payload = snap.data()?.state;
    if (!payload) return;

    applyRemoteState(payload);
  }

  return { init, signIn, signInWithEmail, signOut, pushState };
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
