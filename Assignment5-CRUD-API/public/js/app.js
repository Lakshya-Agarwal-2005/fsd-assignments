// Verdant frontend: every change goes through the REST API, which stores it in MongoDB
const API = "/api/plants";
const ROOMS = ["Living room", "Bedroom", "Kitchen", "Balcony", "Study", "Bathroom"];
const LIGHT = ["Low light", "Medium light", "Bright indirect", "Direct sun"];
const ICONS = ["🪴", "🌿", "🌵", "🌱", "🍃", "🌸", "🌻", "🎋"];

const $ = (id) => document.getElementById(id);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

const state = { all: [], shown: [], room: "", search: "", sort: "thirsty", editing: null, icon: ICONS[0] };

// ---------- API helper ----------
async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || `Request failed (${res.status})`), { errors: data.errors });
  return data;
}

// ---------- READ ----------
async function load() {
  const params = new URLSearchParams({ sort: state.sort });
  if (state.room) params.set("room", state.room);
  if (state.search) params.set("search", state.search);
  try {
    [state.all, state.shown] = await Promise.all([api("GET", API), api("GET", `${API}?${params}`)]);
    render();
  } catch (err) {
    $("plants").innerHTML = `<div class="empty"><h2>Can't reach the plant database</h2><p>${esc(err.message)}. Check that the server and MongoDB are running, then reload.</p></div>`;
  }
}

// ---------- Rendering ----------
function dueText(days) {
  if (days < 0) return { text: `Overdue by ${plural(-days, "day")}`, cls: "late", icon: "💧" };
  if (days === 0) return { text: "Water today", cls: "late", icon: "💧" };
  if (days === 1) return { text: "Water tomorrow", cls: "soon", icon: "⏳" };
  return { text: `Water in ${days} days`, cls: "ok", icon: "✓" };
}

function plantCard(p) {
  const due = dueText(p.daysUntilWater);
  const level = Math.max(0, Math.min(1, p.daysUntilWater / p.waterEveryDays));
  return `
    <article class="plant ${p.daysUntilWater <= 0 ? "thirsty" : ""}" data-id="${p._id}">
      <div class="plant-top">
        <div class="info">
          <div class="pot" aria-hidden="true">${esc(p.icon)}</div>
          <h3>${esc(p.name)}</h3>
          <p class="species">${esc(p.species) || "Unknown species"}</p>
          <div class="meta"><span>${esc(p.room)}</span><span>${esc(p.light)}</span><span>every ${plural(p.waterEveryDays, "day")}</span></div>
        </div>
        <div class="gauge" role="img" aria-label="Water level ${Math.round(level * 100)} percent"><div class="level" style="height:${level * 100}%"></div></div>
      </div>
      ${p.notes ? `<p class="notes">${esc(p.notes)}</p>` : ""}
      <p class="due ${due.cls}"><span aria-hidden="true">${due.icon}</span>${due.text}</p>
      <div class="actions">
        <button class="btn water-now" data-action="water">Water now</button>
        <button class="btn small" data-action="edit" aria-label="Edit ${esc(p.name)}">Edit</button>
        <button class="btn small del" data-action="delete" aria-label="Delete ${esc(p.name)}">Delete</button>
      </div>
    </article>`;
}

function render() {
  const thirsty = state.all.filter((p) => p.daysUntilWater <= 0);
  const rooms = new Set(state.all.map((p) => p.room));

  $("sumPlants").textContent = state.all.length;
  $("sumThirsty").textContent = thirsty.length;
  $("sumRooms").textContent = rooms.size;
  $("headline").textContent = !state.all.length
    ? "Your jungle starts here"
    : thirsty.length
      ? `${plural(thirsty.length, "plant")} ${thirsty.length === 1 ? "is" : "are"} thirsty today`
      : "Everyone is watered. Nice work.";
  $("subline").textContent = thirsty.length
    ? `${thirsty.map((p) => p.name).join(", ")} ${thirsty.length === 1 ? "needs" : "need"} water. Tap "Water now" after you water them.`
    : state.all.length
      ? `Next up: ${[...state.all].sort((a, b) => a.daysUntilWater - b.daysUntilWater)[0].name}.`
      : "Add your first plant and Verdant will tell you when it needs water.";
  $("waterAllBtn").hidden = thirsty.length < 2;

  $("roomTabs").innerHTML = ["", ...ROOMS.filter((r) => rooms.has(r))]
    .map((r) => `<button class="room-tab" data-room="${esc(r)}" aria-pressed="${state.room === r}">${r || "All rooms"}</button>`)
    .join("");

  $("plants").innerHTML = state.shown.length
    ? state.shown.map(plantCard).join("")
    : state.all.length
      ? `<div class="empty"><h2>No plants match</h2><p>Try another room or clear the search.</p></div>`
      : `<div class="empty"><h2>No plants yet</h2><p>Add the first plant in your home to start tracking its watering.</p><button class="btn primary" onclick="openForm()">Add a plant</button></div>`;
}

// ---------- UPDATE: water ----------
async function water(ids) {
  try {
    await Promise.all(ids.map((id) => api("PUT", `${API}/${id}`, { lastWatered: new Date().toISOString() })));
    ids.forEach((id) => {
      const level = document.querySelector(`[data-id="${id}"] .level`);
      if (level) level.style.height = "100%";
    });
    const names = state.all.filter((p) => ids.includes(p._id)).map((p) => p.name);
    toast(`Watered ${names.join(", ")}`);
    setTimeout(load, 900); // let the refill animation finish
  } catch (err) {
    toast(err.message);
  }
}

// ---------- DELETE (with undo, which re-creates the plant with POST) ----------
async function remove(plant) {
  try {
    const { message } = await api("DELETE", `${API}/${plant._id}`);
    const { name, species, icon, room, light, waterEveryDays, lastWatered, notes } = plant;
    toast(message, "Undo", async () => {
      await api("POST", API, { name, species, icon, room, light, waterEveryDays, lastWatered, notes });
      toast(`${name} is back`);
      load();
    });
    load();
  } catch (err) {
    toast(err.message);
  }
}

// ---------- CREATE / UPDATE form ----------
const form = $("plantForm");
const dialog = $("plantDialog");

$("roomSelect").innerHTML = ROOMS.map((r) => `<option>${r}</option>`).join("");
$("lightSelect").innerHTML = LIGHT.map((l) => `<option>${l}</option>`).join("");

function renderIcons() {
  $("iconPicker").innerHTML = ICONS.map(
    (i) => `<button type="button" class="icon-opt" data-icon="${i}" aria-pressed="${state.icon === i}" aria-label="Icon ${i}">${i}</button>`
  ).join("");
}

function clearErrors() {
  form.querySelectorAll(".err").forEach((e) => (e.textContent = ""));
  form.querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
  $("formError").textContent = "";
}

function openForm(plant = null) {
  state.editing = plant;
  state.icon = plant?.icon || ICONS[0];
  clearErrors();
  form.reset();
  $("formTitle").textContent = plant ? `Edit ${plant.name}` : "Add a plant";
  $("saveBtn").textContent = plant ? "Save changes" : "Add plant";
  form.name.value = plant?.name || "";
  form.species.value = plant?.species || "";
  form.room.value = plant?.room || state.room || ROOMS[0];
  form.light.value = plant?.light || LIGHT[1];
  form.waterEveryDays.value = plant?.waterEveryDays || "";
  form.lastWatered.value = (plant ? new Date(plant.lastWatered) : new Date()).toISOString().slice(0, 10);
  form.notes.value = plant?.notes || "";
  renderIcons();
  dialog.showModal();
  form.name.focus();
}

function showErrors(errors = {}) {
  Object.entries(errors).forEach(([field, msg]) => {
    const slot = form.querySelector(`.err[data-for="${field}"]`);
    if (slot) slot.textContent = msg;
    form.elements[field]?.setAttribute("aria-invalid", "true");
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();
  const body = {
    name: form.name.value,
    species: form.species.value,
    icon: state.icon,
    room: form.room.value,
    light: form.light.value,
    waterEveryDays: form.waterEveryDays.value === "" ? undefined : Number(form.waterEveryDays.value),
    lastWatered: form.lastWatered.value ? new Date(form.lastWatered.value + "T12:00:00").toISOString() : undefined,
    notes: form.notes.value,
  };
  try {
    const saved = state.editing ? await api("PUT", `${API}/${state.editing._id}`, body) : await api("POST", API, body);
    dialog.close();
    toast(state.editing ? `Saved changes to ${saved.name}` : `Added ${saved.name}`);
    load();
  } catch (err) {
    $("formError").textContent = err.message;
    showErrors(err.errors);
  }
});

// ---------- Toast ----------
let toastTimer;
function toast(text, actionLabel, onAction) {
  $("toastText").textContent = text;
  const btn = $("toastAction");
  btn.hidden = !actionLabel;
  btn.textContent = actionLabel || "";
  btn.onclick = () => {
    $("toast").hidden = true;
    onAction();
  };
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").hidden = true), 6000);
}

// ---------- Events ----------
$("addBtn").addEventListener("click", () => openForm());
$("closeDialog").addEventListener("click", () => dialog.close());
$("cancelBtn").addEventListener("click", () => dialog.close());
$("iconPicker").addEventListener("click", (e) => {
  const opt = e.target.closest("[data-icon]");
  if (!opt) return;
  state.icon = opt.dataset.icon;
  renderIcons();
});

$("plants").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const plant = state.shown.find((p) => p._id === btn.closest("[data-id]").dataset.id);
  if (btn.dataset.action === "water") water([plant._id]);
  if (btn.dataset.action === "edit") openForm(plant);
  if (btn.dataset.action === "delete") remove(plant);
});

$("waterAllBtn").addEventListener("click", () => water(state.all.filter((p) => p.daysUntilWater <= 0).map((p) => p._id)));

$("roomTabs").addEventListener("click", (e) => {
  const tab = e.target.closest("[data-room]");
  if (!tab) return;
  state.room = tab.dataset.room;
  load();
});

let searchTimer;
$("search").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = e.target.value.trim();
    load();
  }, 250);
});

$("sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  load();
});

$("today").textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
load();
