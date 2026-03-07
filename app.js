const DEFAULT_STATE = {
  pin: "1234",
  soundEnabled: true,
  scoring: {
    basePoints: 10,
    maxBonus: 5,
  },
  children: {
    Alma: {
      age: 10,
      routines: [
        "Stå opp",
        "Ta på deo",
        "Ta på klær",
        "Spis frokost",
        "Ta medisin",
        "Puss tenner",
        "Gre håret",
        "Pakk sekk",
        "Ta på yttertøy",
      ],
    },
    Ludvik: {
      age: 5,
      routines: [
        "Stå opp",
        "Ta på klær",
        "Spis frokost",
        "Puss tenner",
        "Gre håret",
        "Pakk sekk",
        "Ta på yttertøy",
      ],
    },
  },
  history: [],
};

const STORAGE_KEY = "morgenhelt-state-v1";
let state = loadState();
let selectedChild = Object.keys(state.children)[0];
let session = createSession(selectedChild);
let timerId = null;

const childSelector = document.getElementById("childSelector");
const tasksEl = document.getElementById("tasks");
const weeklyStatsEl = document.getElementById("weeklyStats");
const timeBadge = document.getElementById("timeBadge");
const scoreBadge = document.getElementById("scoreBadge");
const sessionTitle = document.getElementById("sessionTitle");
const startMorningBtn = document.getElementById("startMorning");
const finishMorningBtn = document.getElementById("finishMorning");
const openParentModeBtn = document.getElementById("openParentMode");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

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
const installHint = document.getElementById("installHint");

renderAll();
startTimerLoop();
registerServiceWorker();
handleInstallHint();


function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // ignore registration errors in local dev environments
    });
  });
}

function handleInstallHint() {
  if (!installHint) return;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (isStandalone) {
    installHint.hidden = true;
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      scoring: {
        ...structuredClone(DEFAULT_STATE).scoring,
        ...parsed.scoring,
      },
      children: {
        ...structuredClone(DEFAULT_STATE).children,
        ...parsed.children,
      },
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createSession(childName) {
  const routines = state.children[childName].routines;
  return {
    childName,
    startedAt: null,
    finishedAt: null,
    completedTasks: {},
    score: 0,
    routines,
  };
}

function renderAll() {
  renderChildren();
  renderSession();
  renderTasks();
  renderStats();
}

function renderChildren() {
  childSelector.innerHTML = "";
  Object.entries(state.children).forEach(([name, info]) => {
    const btn = document.createElement("button");
    btn.className = `child-btn secondary ${name === selectedChild ? "active" : ""}`;
    btn.textContent = `${name} (${info.age})`;
    btn.addEventListener("click", () => {
      selectedChild = name;
      stopTimerLoop();
      session = createSession(name);
      startTimerLoop();
      renderAll();
    });
    childSelector.appendChild(btn);
  });
}

function renderSession() {
  const started = !!session.startedAt;
  const doneCount = Object.values(session.completedTasks).filter(Boolean).length;
  const total = session.routines.length;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;
  sessionTitle.textContent = `${session.childName} sin morgenøkt`;
  startMorningBtn.disabled = started;
  finishMorningBtn.disabled = !started || doneCount !== session.routines.length;
  scoreBadge.textContent = `Poeng: ${session.score}`;
  timeBadge.textContent = `Tid: ${formatElapsed(session.startedAt)}`;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${doneCount} av ${total} fullført`;
}

function renderTasks() {
  tasksEl.innerHTML = "";
  session.routines.forEach((task, index) => {
    const done = !!session.completedTasks[index];
    const wrapper = document.createElement("div");
    wrapper.className = `task ${done ? "done" : ""}`;

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = done;
    checkbox.disabled = !session.startedAt;
    checkbox.addEventListener("change", () => {
      handleTaskToggle(index, checkbox.checked);
    });

    const span = document.createElement("span");
    span.textContent = `${taskEmoji(task)} ${task}`;

    const points = document.createElement("strong");
    points.textContent = done ? `+${session.completedTasks[index]}p` : "";

    label.append(checkbox, span);
    wrapper.append(label, points);
    tasksEl.appendChild(wrapper);
  });
}

function renderStats() {
  const byChild = Object.keys(state.children).map((name) => {
    const childHistory = state.history.filter((entry) => entry.childName === name);
    const total = childHistory.reduce((sum, entry) => sum + entry.score, 0);
    return {
      name,
      sessions: childHistory.length,
      avg: childHistory.length ? Math.round(total / childHistory.length) : 0,
      best: childHistory.length ? Math.max(...childHistory.map((x) => x.score)) : 0,
    };
  });

  weeklyStatsEl.innerHTML = "";
  byChild.forEach((row) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `
      <h4>${row.name}</h4>
      <p>Økter: ${row.sessions}</p>
      <p>Snitt: ${row.avg}</p>
      <p>Beste: ${row.best}</p>
    `;
    weeklyStatsEl.appendChild(card);
  });
}

function startMorning() {
  session.startedAt = Date.now();
  session.finishedAt = null;
  session.score = 0;
  session.completedTasks = {};
  renderAll();
}

function handleTaskToggle(taskIndex, isDone) {
  if (!session.startedAt) return;
  const current = session.completedTasks[taskIndex] || 0;
  if (isDone && !current) {
    const elapsedMinutes = (Date.now() - session.startedAt) / 60000;
    const speedFactor = Math.max(0, 1 - elapsedMinutes / 30);
    const bonus = Math.round(state.scoring.maxBonus * speedFactor);
    const points = state.scoring.basePoints + bonus;
    session.completedTasks[taskIndex] = points;
    session.score += points;
    if (state.soundEnabled) playBlip();
  }

  if (!isDone && current) {
    delete session.completedTasks[taskIndex];
    session.score -= current;
  }

  renderSession();
  renderTasks();
}

function finishMorning() {
  if (!session.startedAt) return;
  const doneCount = Object.values(session.completedTasks).filter(Boolean).length;
  if (doneCount !== session.routines.length) return;

  session.finishedAt = Date.now();
  session.score += 20;
  state.history = [
    {
      childName: session.childName,
      score: session.score,
      durationSec: Math.round((session.finishedAt - session.startedAt) / 1000),
      completedAt: new Date(session.finishedAt).toISOString(),
    },
    ...state.history,
  ].slice(0, 50);
  saveState();

  alert(`Bra jobbet, ${session.childName}!\nPoeng i dag: ${session.score}`);
  session = createSession(session.childName);
  renderAll();
}

function formatElapsed(startedAt) {
  if (!startedAt) return "00:00";
  const totalSec = Math.floor((Date.now() - startedAt) / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function startTimerLoop() {
  timerId = setInterval(() => {
    timeBadge.textContent = `Tid: ${formatElapsed(session.startedAt)}`;
  }, 1000);
}

function stopTimerLoop() {
  if (timerId) clearInterval(timerId);
}

function playBlip() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 660;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

startMorningBtn.addEventListener("click", startMorning);
finishMorningBtn.addEventListener("click", finishMorning);

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
  if (enteredNewPin) {
    if (!/^\d{4,8}$/.test(enteredNewPin)) {
      alert("PIN må være 4-8 siffer.");
      return;
    }
    state.pin = enteredNewPin;
  }

  state.soundEnabled = soundToggle.checked;
  state.scoring.basePoints = clampNumber(basePoints.value, 1, 50, 10);
  state.scoring.maxBonus = clampNumber(bonusPoints.value, 0, 20, 5);
  saveState();
  parentDialog.close();
  newPin.value = "";
  alert("Innstillinger lagret.");
});

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

function taskEmoji(task) {
  const lower = task.toLowerCase();
  if (lower.includes("opp")) return "⏰";
  if (lower.includes("frokost")) return "🥣";
  if (lower.includes("tenner")) return "🪥";
  if (lower.includes("håret")) return "🪮";
  if (lower.includes("sekk")) return "🎒";
  if (lower.includes("yttertøy")) return "🧥";
  if (lower.includes("medisin")) return "💊";
  if (lower.includes("deo")) return "🧴";
  if (lower.includes("klær")) return "👕";
  return "✅";
}

window.addEventListener("beforeunload", saveState);
