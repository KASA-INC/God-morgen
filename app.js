const DEFAULT_STATE = {
  pin: "1234",
  soundEnabled: true,
  scoring: { basePoints: 10, maxBonus: 5 },
  children: {
    Alma: {
      age: 10,
      routines: ["Stå opp", "Ta på deo", "Ta på klær", "Spis frokost", "Ta medisin", "Puss tenner", "Gre håret", "Pakk sekk", "Ta på yttertøy"],
    },
    Ludvik: {
      age: 5,
      routines: ["Stå opp", "Ta på klær", "Spis frokost", "Puss tenner", "Gre håret", "Pakk sekk", "Ta på yttertøy"],
    },
  },
  history: [],
  meta: { updatedAt: 0 },
};

const STORAGE_KEY = "morgenhelt-state-v1";
let state = loadState();
const sessions = createAllSessions();
let timerId = null;
let audioCtx = null;

const childBoards = document.getElementById("childBoards");
const weeklyStatsEl = document.getElementById("weeklyStats");
const openParentModeBtn = document.getElementById("openParentMode");
const historyFact = document.getElementById("historyFact");
const weatherFact = document.getElementById("weatherFact");
const todayFact = document.getElementById("todayFact");

const profileDialog = document.getElementById("profileDialog");
const openProfileBtn = document.getElementById("openProfile");
const closeProfileBtn = document.getElementById("closeProfile");
const googleLoginBtn = document.getElementById("googleLogin");
const facebookLoginBtn = document.getElementById("facebookLogin");
const appleLoginBtn = document.getElementById("appleLogin");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");
const setupChildName = document.getElementById("setupChildName");
const setupTasks = document.getElementById("setupTasks");
const addSetupChild = document.getElementById("addSetupChild");

const cloud = createCloudAdapter();

const parentDialog = document.getElementById("parentDialog");
const pinForm = document.getElementById("pinForm");
const pinInput = document.getElementById("pinInput");
const parentSettings = document.getElementById("parentSettings");
const cancelPin = document.getElementById("cancelPin");
const closeParent = document.getElementById("closeParent");
const newPin = document.getElementById("newPin");
const soundToggle = document.getElementById("soundToggle");
const basePoints = document.getElementById("basePoints");
const bonusPoints = document.getElementById("bonusPoints");
const saveSettings = document.getElementById("saveSettings");

renderAll();
startTimerLoop();
registerServiceWorker();
renderDailyFacts();
setupProfileUI();
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
  const defaults = structuredClone(DEFAULT_STATE).children;
  const source = rawChildren && typeof rawChildren === "object" ? rawChildren : {};

  return Object.fromEntries(
    Object.entries({ ...defaults, ...source }).map(([name, info]) => {
      const defaultInfo = defaults[name] || { age: 0, routines: [] };
      const validInfo = info && typeof info === "object" ? info : {};
      const routines = Array.isArray(validInfo.routines)
        ? validInfo.routines.filter((task) => typeof task === "string" && task.trim()).map((task) => task.trim())
        : defaultInfo.routines;

      return [
        name,
        {
          age: Number.isFinite(validInfo.age) ? Math.max(0, Math.round(validInfo.age)) : defaultInfo.age,
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

function renderDailyFacts() {
  if (!historyFact || !weatherFact || !todayFact) return;

  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const historicByDate = {
    "03-08": "Den internasjonale kvinnedagen markeres globalt.",
    "04-12": "I 1961 ble Jurij Gagarin første menneske i verdensrommet.",
    "05-17": "Norge feirer grunnlovsdagen med tog, flagg og is.",
    "07-20": "I 1969 landet Apollo 11 på månen.",
    "11-09": "I 1989 begynte Berlinmurens fall.",
  };

  const weatherByMonth = [
    "Kald vinterluft ute ❄️ – superheltlag på med yttertøy!",
    "Friskt i lufta 🌬️ – perfekt dag for raske morgenhelter.",
    "Vårtegn i sikte 🌱 – dagen passer for en energistart.",
    "Mild vårdag 🌤️ – herlig dag for superhelter på oppdrag.",
    "Lysere dager ☀️ – godt humør-vær for morgenteamet.",
    "Sommervibber 🌼 – husk drikkeflaske i sekken.",
    "Sommer og solbriller 😎 – rask rutine, mer tid ute.",
    "Lun sensommer 🌇 – fin dag for en ny personlig rekord.",
    "Klar høstluft 🍂 – god dag for fokus og fart.",
    "Høstvind og skjerf 🧣 – superheltmodus: på med yttertøy!",
    "Mørkere morgener 🍁 – ekstra stjerne for å komme raskt i gang.",
    "Vinterstemning 🎄 – varm start gir sterk dag.",
  ];

  const dayMission = [
    "Dagens oppdrag: Fullfør de første 2 oppgavene på under 6 minutter!",
    "Dagens oppdrag: Ta på yttertøy med superhelt-fart 💨",
    "Dagens oppdrag: Null mas + masse teamwork = bonus-stemning!",
    "Dagens oppdrag: Samle minst én ny personlig rekord i dag 🏅",
    "Dagens oppdrag: Smil etter hver fullførte oppgave 😄",
    "Dagens oppdrag: Morgenrutine uten pauser i mellom oppgaver!",
    "Dagens oppdrag: Fullfør alt før favorittsangen er ferdig 🎵",
  ];

  historyFact.textContent = historicByDate[mmdd] || `På denne datoen (${mmdd}) har verden fått mange små og store helteøyeblikk.`;
  weatherFact.textContent = weatherByMonth[now.getMonth()];
  todayFact.textContent = dayMission[now.getDay()];
}

function renderAll() {
  renderBoards();
  renderStats();
}

function renderBoards() {
  childBoards.innerHTML = "";
  Object.entries(state.children).forEach(([name, info]) => {
    const session = sessions[name];
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

    const taskGrid = board.querySelector(".task-grid");
    info.routines.forEach((task, idx) => {
      const details = session.completedTasks[idx];
      const done = !!details;
      const taskBtn = document.createElement("button");
      taskBtn.className = `task-btn ${done ? "done" : ""}`;
      taskBtn.disabled = !started;
      taskBtn.innerHTML = `
        <div class="task-text">${escapeHtml(task)}</div>
        ${done ? `<small>${formatDuration(details.durationSec)} · +${details.points} poeng</small>` : ""}
      `;
      taskBtn.addEventListener("click", () => toggleTask(name, idx));
      taskGrid.appendChild(taskBtn);
    });

    const addTaskBtn = document.createElement("button");
    addTaskBtn.className = "task-btn add-task-btn";
    addTaskBtn.innerHTML = '<div class="task-text">Legg til oppgave</div>';
    addTaskBtn.addEventListener("click", () => addTask(name));
    taskGrid.appendChild(addTaskBtn);

    childBoards.appendChild(board);
  });
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
  if (doneCount === total) {
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
  if (!session.startedAt || doneCount !== total) return;

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
      <div class="graph-list">${graphBars}</div>
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
  pinForm.hidden = false;
  parentSettings.hidden = true;
  pinInput.value = "";
  parentDialog.showModal();
});

pinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (pinInput.value !== state.pin) {
    alert("Feil PIN");
    return;
  }
  pinForm.hidden = true;
  parentSettings.hidden = false;
  soundToggle.checked = !!state.soundEnabled;
  basePoints.value = state.scoring.basePoints;
  bonusPoints.value = state.scoring.maxBonus;
});

cancelPin.addEventListener("click", () => parentDialog.close());
closeParent.addEventListener("click", () => parentDialog.close());

saveSettings.addEventListener("click", () => {
  const enteredNewPin = newPin.value.trim();
  if (enteredNewPin && !/^\d{4,8}$/.test(enteredNewPin)) {
    alert("PIN må være 4-8 siffer.");
    return;
  }
  if (enteredNewPin) state.pin = enteredNewPin;

  state.soundEnabled = soundToggle.checked;
  state.scoring.basePoints = clampNumber(basePoints.value, 1, 50, 10);
  state.scoring.maxBonus = clampNumber(bonusPoints.value, 0, 20, 5);
  saveState();
  newPin.value = "";
  parentDialog.close();
  alert("Innstillinger lagret.");
});

function setupProfileUI() {
  if (!profileDialog) return;

  openProfileBtn?.addEventListener("click", () => profileDialog.showModal());
  closeProfileBtn?.addEventListener("click", () => profileDialog.close());

  googleLoginBtn?.addEventListener("click", () => cloud.signIn("google"));
  facebookLoginBtn?.addEventListener("click", () => cloud.signIn("facebook"));
  appleLoginBtn?.addEventListener("click", () => cloud.signIn("apple"));
  logoutBtn?.addEventListener("click", () => cloud.signOut());

  addSetupChild?.addEventListener("click", () => {
    const childName = setupChildName.value.trim();
    const tasks = setupTasks.value
      .split("\n")
      .map((task) => task.trim())
      .filter(Boolean);

    if (!childName || !tasks.length) {
      alert("Legg inn barnets navn og minst én oppgave.");
      return;
    }

    state.children[childName] = { age: 0, routines: tasks };
    sessions[childName] = createSession(childName);
    saveState();
    renderAll();
    setupChildName.value = "";
    setupTasks.value = "";
  });
}

function updateAuthStatus(text) {
  if (authStatus) authStatus.textContent = text;
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
    const remoteUpdatedAt = Number(nextState?.meta?.updatedAt) || 0;
    const localUpdatedAt = Number(state?.meta?.updatedAt) || 0;

    if (remoteUpdatedAt <= localUpdatedAt) return;

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
    unsubscribeProfile = db.collection("profiles").doc(uid).onSnapshot((snap) => {
      if (!snap.exists) return;
      const payload = snap.data()?.state;
      if (!payload) return;
      applyRemoteState(payload);
    });
  }

  function init() {
    if (!isEnabled()) {
      updateAuthStatus("Firebase ikke konfigurert. Legg inn firebase-config.js for ekte innlogging.");
      return;
    }

    ensureFirebase();

    auth.onAuthStateChanged(async (user) => {
      currentUser = user;
      if (!user) {
        unsubscribeProfile?.();
        unsubscribeProfile = null;
        updateAuthStatus("Ikke logget inn.");
        return;
      }

      updateAuthStatus(`Logget inn som ${user.email || user.displayName || "bruker"}. Synk aktiv.`);
      setProfileSubscription(user.uid);
      await pullState();
    });
  }

  function providerFor(type) {
    if (type === "google") return new firebase.auth.GoogleAuthProvider();
    if (type === "facebook") return new firebase.auth.FacebookAuthProvider();
    if (type === "apple") return new firebase.auth.OAuthProvider("apple.com");
    return null;
  }

  async function signIn(providerType) {
    if (!ensureFirebase()) {
      alert("Firebase er ikke konfigurert. Se README for oppsett av ekte Gmail/Facebook/Apple-innlogging.");
      return;
    }

    const provider = providerFor(providerType);
    if (!provider) return;

    try {
      await auth.signInWithPopup(provider);
    } catch (err) {
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/cancelled-popup-request") {
        await auth.signInWithRedirect(provider);
        return;
      }
      alert(`Innlogging feilet: ${err?.message || "ukjent feil"}`);
    }
  }

  async function signOut() {
    if (!auth) return;
    await auth.signOut();
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

  return { init, signIn, signOut, pushState };
}
function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

window.addEventListener("pointerdown", () => {
  const ctx = createAudioContext();
  if (ctx?.state === "suspended") ctx.resume().catch(() => {});
}, { once: true });

window.addEventListener("beforeunload", saveState);
