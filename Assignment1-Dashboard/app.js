/* Monsoon Club artist dashboard: data, charts and interactions */

// ---------- Data ----------
const TRACKS = [
  { title: "Monsoon Letters", album: "Rooftop Weather", year: 2025, share: 0.31, saves: 0.081, skip: 18, notes: [62, 65, 69, 67, 65, 62, 60, 62] },
  { title: "Chai at 2 AM", album: "Rooftop Weather", year: 2025, share: 0.22, saves: 0.066, skip: 22, notes: [57, 60, 64, 62, 60, 57, 55, 57] },
  { title: "Local Train Lullaby", album: "Platform No. 4", year: 2024, share: 0.17, saves: 0.072, skip: 15, notes: [60, 64, 67, 72, 67, 64, 60, 59] },
  { title: "Neon Rickshaw", album: "Platform No. 4", year: 2024, share: 0.13, saves: 0.049, skip: 29, notes: [64, 64, 67, 69, 67, 64, 62, 64] },
  { title: "Petrichor", album: "Single", year: 2026, share: 0.1, saves: 0.09, skip: 12, notes: [69, 67, 65, 64, 62, 64, 65, 69] },
  { title: "Paper Boats (demo)", album: "Unreleased", year: 2026, share: 0.07, saves: 0.11, skip: 9, notes: [60, 62, 64, 67, 64, 62, 60, 55] },
];

const CITIES = [
  ["Mumbai", 0.24], ["Bengaluru", 0.19], ["Pune", 0.14], ["Delhi", 0.12], ["Kolkata", 0.08], ["London", 0.05],
];

const FEED = [
  ["AK", "#6d3ff5", "Aanya K. added <b>Petrichor</b> to 'rainy day'", "4 min ago"],
  ["RS", "#e0832a", "Rohit S. shared <b>Monsoon Letters</b> on Instagram", "18 min ago"],
  ["DJ", "#1b8a5a", "A Mumbai DJ added you to <b>Indie Nights</b>", "1 hr ago"],
  ["MT", "#c2417a", "Meera T. pre-saved <b>Paper Boats</b>", "3 hr ago"],
  ["+", "#2a78d6", "312 new followers from playlist placements", "Today"],
];

// Per-range totals. 12 months is shown month by month, the others day by day.
const RANGES = {
  7: { label: "Daily streams, last 7 days", points: 7, listeners: 618400, streams: 1084300, followers: 41820, earnings: 27200, prev: [0.91, 0.94, 0.97, 1.04] },
  28: { label: "Daily streams, last 28 days", points: 28, listeners: 742900, streams: 4310500, followers: 41820, earnings: 108400, prev: [0.86, 0.88, 0.95, 1.07] },
  365: { label: "Monthly streams, last 12 months", points: 12, listeners: 742900, streams: 39870000, followers: 41820, earnings: 1002600, prev: [0.62, 0.55, 0.71, 1.28] },
};

const PLATFORMS = [
  { name: "Spotify", share: 0.58 },
  { name: "YouTube Music", share: 0.27 },
  { name: "Apple Music", share: 0.15 },
];

// Small seeded random so the numbers are the same on every load
function seeded(seed) {
  return () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
}

function series(total, points, seed) {
  const rand = seeded(seed);
  const raw = Array.from({ length: points }, (_, i) => 0.75 + 0.5 * (i / points) + rand() * 0.25);
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => Math.round((v / sum) * total));
}

function labelsFor(range) {
  const today = new Date(2026, 9, 26);
  if (range === 365) {
    return Array.from({ length: 12 }, (_, i) => new Date(2026, 9 - 11 + i, 1).toLocaleString("en-IN", { month: "short" }));
  }
  return Array.from({ length: range }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (range - 1 - i));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  });
}

// ---------- Helpers ----------
const $ = (s) => document.querySelector(s);
const fmt = (n) => n.toLocaleString("en-IN");
const compact = (n) => (n >= 1e7 ? (n / 1e7).toFixed(2) + " Cr" : n >= 1e5 ? (n / 1e5).toFixed(1) + " L" : fmt(n));
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

// Series colors (validated categorical palette, light and dark steps)
const SERIES = {
  light: ["#2a78d6", "#eb6834", "#1baf7a"],
  dark: ["#3987e5", "#d95926", "#199e70"],
};

function countUp(el, to, format) {
  if (reduceMotion) { el.textContent = format(to); return; }
  const from = Number(el.dataset.value || 0);
  const start = performance.now();
  const step = (t) => {
    const p = Math.min((t - start) / 700, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(Math.round(from + (to - from) * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  el.dataset.value = to;
  requestAnimationFrame(step);
}

function toast(message) {
  $("#toastBody").textContent = message;
  bootstrap.Toast.getOrCreateInstance($("#toast"), { delay: 2500 }).show();
}

// ---------- State ----------
let range = 28;
let sortKey = "streams";
let sortDir = -1;
let charts = { main: null, sparks: [] };

// ---------- Statistic cards ----------
const STATS = [
  { key: "listeners", label: "Monthly listeners", icon: "bi-headphones", format: compact },
  { key: "streams", label: "Streams", icon: "bi-play-circle", format: compact },
  { key: "followers", label: "Followers", icon: "bi-person-heart", format: fmt },
  { key: "earnings", label: "Earnings", icon: "bi-currency-rupee", format: (n) => "₹" + compact(n) },
];

function buildStatCards() {
  $("#stats").innerHTML = STATS.map((s, i) => `
    <div class="col-12 col-sm-6 col-xl-3">
      <article class="stat-card">
        <div class="stat-top"><span>${s.label}</span><span class="stat-icon"><i class="bi ${s.icon}"></i></span></div>
        <p class="stat-value" id="v-${s.key}">0</p>
        <span class="delta" id="d-${s.key}"></span>
        <div class="spark"><canvas id="spark-${i}" aria-hidden="true"></canvas></div>
      </article>
    </div>`).join("");
}

function updateStats() {
  const r = RANGES[range];
  STATS.forEach((s, i) => {
    countUp($("#v-" + s.key), r[s.key], s.format);
    const pct = ((1 / r.prev[i] - 1) * 100).toFixed(1);
    const up = pct >= 0;
    $("#d-" + s.key).className = "delta " + (up ? "up" : "down");
    $("#d-" + s.key).innerHTML = `<i class="bi ${up ? "bi-arrow-up-right" : "bi-arrow-down-right"}"></i> ${up ? "+" : ""}${pct}% <small>vs previous period</small>`;
  });
}

// ---------- Charts ----------
function themeColors() {
  const dark = document.documentElement.dataset.bsTheme === "dark";
  return { series: dark ? SERIES.dark : SERIES.light, grid: css("--line"), text: css("--muted"), card: css("--card") };
}

function drawCharts() {
  const c = themeColors();
  const r = RANGES[range];
  const labels = labelsFor(range);

  charts.main?.destroy();
  charts.sparks.forEach((s) => s.destroy());

  const datasets = PLATFORMS.map((p, i) => ({
    label: p.name,
    data: series(r.streams * p.share, r.points, 11 + i * 7 + range),
    borderColor: c.series[i],
    backgroundColor: c.series[i],
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBorderColor: c.card,
    pointHoverBorderWidth: 2,
    tension: 0.3,
  }));

  charts.main = new Chart($("#streamsChart"), {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text, maxTicksLimit: 8 } },
        y: { grid: { color: c.grid }, border: { display: false }, ticks: { color: c.text, callback: (v) => compact(v) } },
      },
    },
  });

  $("#legend").innerHTML = PLATFORMS.map((p, i) => `<span><i style="background:${c.series[i]}"></i>${p.name}</span>`).join("");
  $("#chartSub").textContent = r.label;

  // Sparklines: one per stat card
  charts.sparks = STATS.map((s, i) => new Chart($("#spark-" + i), {
    type: "line",
    data: { labels, datasets: [{ data: series(r[s.key], r.points, 3 + i + range), borderColor: css("--violet"), borderWidth: 2, pointRadius: 0, tension: 0.35, fill: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: reduceMotion ? false : undefined },
  }));
}

// ---------- Cities, goal, feed ----------
function updateCities() {
  const listeners = RANGES[range].listeners;
  const max = CITIES[0][1];
  $("#cities").innerHTML = CITIES.map(([city, share]) => `
    <li>
      <div class="city-row"><span>${city}</span><span>${fmt(Math.round(listeners * share))}</span></div>
      <div class="city-bar"><div style="width:${(share / max) * 100}%"></div></div>
    </li>`).join("");
}

function updateGoal() {
  const pct = RANGES[range].listeners / 1e6;
  $("#ringFg").style.strokeDashoffset = 314.16 * (1 - pct);
  countUp($("#goalPct"), Math.round(pct * 100), (n) => n + "%");
  $("#goalRing").setAttribute("aria-label", `${Math.round(pct * 100)} percent of the one million listener goal`);
}

function renderFeed() {
  $("#feedList").innerHTML = FEED.map(([who, color, text, time]) => `
    <li><span class="who" style="background:${color}">${who}</span><div><p>${text}</p><time>${time}</time></div></li>`).join("");
}

// ---------- Tracks table ----------
function trackRows() {
  const total = RANGES[range].streams;
  const q = $("#search").value.trim().toLowerCase();
  return TRACKS.map((t, i) => ({ ...t, i, streams: Math.round(total * t.share), saves: Math.round(total * t.share * t.saves) }))
    .filter((t) => !q || t.title.toLowerCase().includes(q) || t.album.toLowerCase().includes(q))
    .sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir);
}

function renderTracks() {
  const rows = trackRows();
  $("#trackBody").innerHTML = rows.length
    ? rows.map((t) => `
      <tr>
        <td class="ps-3"><div class="track-name">${t.title}</div><div class="track-album">${t.album}, ${t.year}</div></td>
        <td>${fmt(t.streams)}</td>
        <td>${fmt(t.saves)}</td>
        <td>${t.skip}%</td>
        <td class="pe-3 text-end"><button class="mini-play ${playing === t.i ? "on" : ""}" data-track="${t.i}" aria-label="Play ${t.title}"><i class="bi ${playing === t.i ? "bi-pause-fill" : "bi-play-fill"}"></i></button></td>
      </tr>`).join("")
    : `<tr><td colspan="5" class="text-center text-secondary py-4">No track matches "${$("#search").value.replace(/[<>&"]/g, "")}". Try a different name.</td></tr>`;

  document.querySelectorAll(".sort").forEach((b) => {
    b.removeAttribute("aria-sort");
    if (b.dataset.key === sortKey) b.setAttribute("aria-sort", sortDir === -1 ? "descending" : "ascending");
  });
}

// ---------- Audio preview (Web Audio synth) + waveform ----------
let audioCtx = null;
let analyser = null;
let playing = null;
let stopTimer = null;
let voices = [];

function setHero(i) {
  const t = TRACKS[i];
  $("#npTitle").textContent = t.title;
  $("#coverInitial").textContent = t.title[0];
  $("#npMeta").textContent = `${fmt(Math.round(RANGES[range].streams * t.share))} streams in this period, from ${t.album} (${t.year})`;
  $("#npPlay").setAttribute("aria-label", (playing === i ? "Pause " : "Play ") + t.title);
}

function stopPreview() {
  voices.forEach((v) => { try { v.stop(); } catch { /* already stopped */ } });
  voices = [];
  clearTimeout(stopTimer);
  playing = null;
  $("#nowPlaying").classList.remove("playing");
  $("#npPlay").innerHTML = '<i class="bi bi-play-fill"></i>';
  renderTracks();
}

function playPreview(i) {
  if (playing === i) return stopPreview();
  stopPreview();
  audioCtx = audioCtx || new AudioContext();
  if (!analyser) {
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.connect(audioCtx.destination);
  }
  const beat = 0.32;
  const now = audioCtx.currentTime + 0.05;
  TRACKS[i].notes.forEach((midi, n) => {
    [0, 12].forEach((octave, layer) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = layer ? "sine" : "triangle";
      osc.frequency.value = 440 * Math.pow(2, (midi - 12 * layer + octave - 69) / 12);
      const t0 = now + n * beat;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(layer ? 0.08 : 0.18, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + beat * 1.6);
      osc.connect(gain).connect(analyser);
      osc.start(t0);
      osc.stop(t0 + beat * 1.7);
      voices.push(osc);
    });
  });
  playing = i;
  setHero(i);
  $("#nowPlaying").classList.add("playing");
  $("#npPlay").innerHTML = '<i class="bi bi-pause-fill"></i>';
  stopTimer = setTimeout(stopPreview, TRACKS[i].notes.length * beat * 1000 + 600);
  renderTracks();
}

function drawWave() {
  const canvas = $("#wave");
  const ctx = canvas.getContext("2d");
  const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
  const h = (canvas.height = 56 * devicePixelRatio);
  const bars = 48;
  const data = new Uint8Array(64);
  if (analyser && playing !== null) analyser.getByteFrequencyData(data);
  ctx.clearRect(0, 0, w, h);
  for (let b = 0; b < bars; b++) {
    const idle = 0.25 + 0.2 * Math.abs(Math.sin(b * 0.55)) + 0.15 * Math.abs(Math.sin(b * 1.7));
    const live = playing !== null ? data[Math.floor((b / bars) * 40)] / 255 : 0;
    const v = Math.max(idle * (playing !== null ? 0.35 : 1), live);
    const bh = Math.max(4, v * h);
    ctx.fillStyle = b / bars < 0.38 || playing !== null ? "#ffb020" : "rgba(255,255,255,.28)";
    const bw = w / bars;
    ctx.beginPath();
    ctx.roundRect(b * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh, 3 * devicePixelRatio);
    ctx.fill();
  }
  requestAnimationFrame(drawWave);
}

// ---------- Countdown ----------
function tickCountdown() {
  const release = new Date("2026-11-21T00:00:00+05:30");
  const ms = Math.max(0, release - new Date());
  $("#cd-d").textContent = Math.floor(ms / 864e5);
  $("#cd-h").textContent = Math.floor((ms / 36e5) % 24);
  $("#cd-m").textContent = Math.floor((ms / 6e4) % 60);
}

// ---------- Theme ----------
function applyTheme(theme) {
  document.documentElement.dataset.bsTheme = theme;
  const btn = $("#themeBtn");
  btn.innerHTML = `<i class="bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}"></i>`;
  btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  store.set("mc-theme", theme);
}

// ---------- Render everything for the current range ----------
function refresh() {
  updateStats();
  drawCharts();
  updateCities();
  updateGoal();
  renderTracks();
  setHero(playing ?? 0);
}

// ---------- Events ----------
document.querySelectorAll("input[name=range]").forEach((r) =>
  r.addEventListener("change", () => { range = Number(r.value); refresh(); })
);

$("#search").addEventListener("input", renderTracks);

document.querySelectorAll(".sort").forEach((b) =>
  b.addEventListener("click", () => {
    sortDir = sortKey === b.dataset.key ? -sortDir : -1;
    sortKey = b.dataset.key;
    renderTracks();
  })
);

$("#trackBody").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-track]");
  if (btn) playPreview(Number(btn.dataset.track));
});

$("#npPlay").addEventListener("click", () => {
  const current = TRACKS.findIndex((t) => t.title === $("#npTitle").textContent);
  playPreview(current);
});

$("#themeBtn").addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.bsTheme === "dark" ? "light" : "dark");
  drawCharts();
});

$("#collapseBtn").addEventListener("click", () => {
  const collapsed = document.querySelector(".shell").classList.toggle("collapsed");
  $("#collapseBtn").setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  setTimeout(() => charts.main?.resize(), 260);
});

$("#exportBtn").addEventListener("click", () => {
  const rows = trackRows();
  const csv = ["Track,Album,Year,Streams,Saves,Skip rate %", ...rows.map((t) => `"${t.title}","${t.album}",${t.year},${t.streams},${t.saves},${t.skip}`)].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `monsoon-club-tracks-${range}d.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`Exported ${rows.length} tracks to CSV`);
});

// ---------- Start ----------
applyTheme(store.get("mc-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => new bootstrap.Tooltip(el));
buildStatCards();
renderFeed();
refresh();
tickCountdown();
setInterval(tickCountdown, 30000);
drawWave();
