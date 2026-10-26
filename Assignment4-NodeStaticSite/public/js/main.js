// Shared behaviour for every Pixel Pit page

// Mobile menu
const menuBtn = document.querySelector(".menu-btn");
const nav = document.getElementById("nav");
menuBtn?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});

document.getElementById("year").textContent = new Date().getFullYear();

// Games page: filter cabinets by genre
const filters = document.querySelectorAll(".filter");
filters.forEach((btn) =>
  btn.addEventListener("click", () => {
    const genre = btn.dataset.filter;
    filters.forEach((b) => b.setAttribute("aria-pressed", b === btn));
    let shown = 0;
    document.querySelectorAll(".cabinet").forEach((cab) => {
      cab.hidden = genre !== "all" && cab.dataset.genre !== genre;
      if (!cab.hidden) shown++;
    });
    document.getElementById("gameCount").textContent =
      genre === "all" ? `Showing all ${shown} cabinets` : `Showing ${shown} ${btn.textContent.toLowerCase()} cabinets`;
  })
);

// Visit page: highlight today and show whether we are open right now
const openNow = document.getElementById("openNow");
if (openNow) {
  // [opening hour, closing hour] per weekday (0 = Sunday). 25 means 1 am the next day.
  const HOURS = { 0: [10, 22], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 22], 5: [11, 25], 6: [10, 25] };
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const yesterday = (day + 6) % 7;
  const open = (hour >= HOURS[day][0] && hour < HOURS[day][1]) || hour < HOURS[yesterday][1] - 24;

  document.querySelector(`tr[data-day="${day}"]`)?.classList.add("today");
  openNow.textContent = open ? "Open now" : `Closed now, opens at ${HOURS[day][0] > hour ? HOURS[day][0] : HOURS[(day + 1) % 7][0]} am`;
  openNow.classList.add(open ? "yes" : "no");
}
