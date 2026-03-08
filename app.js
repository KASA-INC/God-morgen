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
};

const STORAGE_KEY = "morgenhelt-state-v1";
let state = loadState();
const sessions = createAllSessions();
let timerId = null;

const childBoards = document.getElementById("childBoards");
const weeklyStatsEl = document.getElementById("weeklyStats");
const openParentModeBtn = document.getElementById("openParentMode");
const installHint = document.getElementById("installHint");

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
handleInstallHint();

function createAllSessions() {
  return Object.fromEntries(Object.keys(state.children).map((name) => [name, createSession(name)]));
}

function createSession(childName) {
  return { childName, startedAt: null, completedTasks: {}, score: 0 };
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
      children: { ...structuredClone(DEFAULT_STATE).children, ...parsed.children },
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

function handleInstallHint() {
  if (!installHint) return;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  installHint.hidden = !!isStandalone;
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
        <h3>${name} (${info.age})</h3>
        <div class="badges">
          <span class="badge">⏱ ${formatElapsed(session.startedAt)}</span>
          <span class="badge">⭐ ${session.score}</span>
        </div>
      </div>
      <div class="progress-wrap"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p>${doneCount} av ${total} fullført</p>
      <div class="actions">
        <button class="primary start-btn" ${started ? "disabled" : ""}>Start ${name}</button>
        <button class="success finish-btn" ${!started || doneCount !== total ? "disabled" : ""}>Fullfør</button>
      </div>
      <div class="task-grid"></div>
    `;

    board.querySelector(".start-btn").addEventListener("click", () => startMorning(name));
    board.querySelector(".finish-btn").addEventListener("click", () => finishMorning(name));

    const taskGrid = board.querySelector(".task-grid");
    info.routines.forEach((task, idx) => {
      const done = !!session.completedTasks[idx];
      const taskBtn = document.createElement("button");
      taskBtn.className = `task-btn ${done ? "done" : ""}`;
      taskBtn.disabled = !started;
      taskBtn.innerHTML = `<div>${taskEmoji(task)} ${task}</div>${done ? `<small>+${session.completedTasks[idx]} poeng</small>` : ""}`;
      taskBtn.addEventListener("click", () => toggleTask(name, idx));
      taskGrid.appendChild(taskBtn);
    });

    childBoards.appendChild(board);
  });
}

function startMorning(childName) {
  sessions[childName] = createSession(childName);
  sessions[childName].startedAt = Date.now();
  renderBoards();
}

function toggleTask(childName, taskIndex) {
  const session = sessions[childName];
  if (!session.startedAt) return;

  const current = session.completedTasks[taskIndex] || 0;
  if (!current) {
    const elapsedMinutes = (Date.now() - session.startedAt) / 60000;
    const speedFactor = Math.max(0, 1 - elapsedMinutes / 30);
    const bonus = Math.round(state.scoring.maxBonus * speedFactor);
    const points = state.scoring.basePoints + bonus;
    session.completedTasks[taskIndex] = points;
    session.score += points;
    if (state.soundEnabled) playBlip();
  } else {
    delete session.completedTasks[taskIndex];
    session.score -= current;
  }

  renderBoards();
}

function finishMorning(childName) {
  const session = sessions[childName];
  const total = state.children[childName].routines.length;
  const doneCount = Object.values(session.completedTasks).filter(Boolean).length;
  if (!session.startedAt || doneCount !== total) return;

  const finishedAt = Date.now();
  session.score += 20;
  state.history = [
    {
      childName,
      score: session.score,
      durationSec: Math.round((finishedAt - session.startedAt) / 1000),
      completedAt: new Date(finishedAt).toISOString(),
    },
    ...state.history,
  ].slice(0, 60);

  alert(`Bra jobbet, ${childName}!\nPoeng i dag: ${session.score}`);
  sessions[childName] = createSession(childName);
  saveState();
  renderAll();
}

function renderStats() {
  weeklyStatsEl.innerHTML = "";
  Object.keys(state.children).forEach((name) => {
    const entries = state.history.filter((h) => h.childName === name);
    const total = entries.reduce((sum, item) => sum + item.score, 0);
    const avg = entries.length ? Math.round(total / entries.length) : 0;
    const best = entries.length ? Math.max(...entries.map((x) => x.score)) : 0;

    const card = document.createElement("div");
    card.className = "stat-card";
    card.innerHTML = `<h4>${name}</h4><p>Økter: ${entries.length}</p><p>Snitt: ${avg}</p><p>Beste: ${best}</p>`;
    weeklyStatsEl.appendChild(card);
  });
}

function startTimerLoop() {
  timerId = setInterval(renderBoards, 1000);
}

function formatElapsed(startedAt) {
  if (!startedAt) return "00:00";
  const totalSec = Math.floor((Date.now() - startedAt) / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const sec = String(totalSec % 60).padStart(2, "0");
  return `${min}:${sec}`;
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

function playBlip() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 700;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
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

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

window.addEventListener("beforeunload", saveState);
