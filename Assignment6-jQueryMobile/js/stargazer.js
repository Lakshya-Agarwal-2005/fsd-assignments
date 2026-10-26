/* Stargazer: moon phase, sky events, planet guide and an observation log (jQuery + jQuery Mobile) */

var store = {
  get: function (key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  },
  set: function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
  }
};

function esc(s) { return $("<span>").text(s).html(); }

/* ---------------- Moon maths ---------------- */
var SYNODIC = 29.530588853;                       // days between two new moons
var KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // a reference new moon

function moonAge(date) {
  var days = (date.getTime() - KNOWN_NEW_MOON) / 864e5;
  return ((days % SYNODIC) + SYNODIC) % SYNODIC;
}

function moonInfo(date) {
  var age = moonAge(date);
  var f = age / SYNODIC;
  var illumination = (1 - Math.cos(2 * Math.PI * f)) / 2;
  var names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  return { age: age, fraction: f, illumination: illumination, name: names[Math.round(f * 8) % 8] };
}

// Draws the lit part of the moon as an SVG path
function drawMoon(fraction) {
  var r = 50, k = Math.cos(2 * Math.PI * fraction), rx = Math.abs(k) * r, lit;
  if (fraction < 0.5) {
    lit = "M0," + -r + " A" + r + "," + r + " 0 0 1 0," + r + " A" + rx + "," + r + " 0 0 " + (k > 0 ? 0 : 1) + " 0," + -r;
  } else {
    lit = "M0," + -r + " A" + r + "," + r + " 0 0 0 0," + r + " A" + rx + "," + r + " 0 0 " + (k > 0 ? 1 : 0) + " 0," + -r;
  }
  $("#moon").html(
    '<circle r="50" fill="#2a2f57"/>' +
    '<path d="' + lit + '" fill="#f4e9c1"/>' +
    '<circle cx="-14" cy="-12" r="7" fill="rgba(0,0,0,.08)"/><circle cx="16" cy="14" r="10" fill="rgba(0,0,0,.07)"/><circle cx="8" cy="-24" r="4" fill="rgba(0,0,0,.08)"/>'
  );
}

function nextPhase(from, targetFraction) {
  var daysAhead = ((targetFraction * SYNODIC - moonAge(from)) + SYNODIC) % SYNODIC;
  if (daysAhead > SYNODIC - 1) daysAhead -= SYNODIC; // the phase happened within the last day: count it as tonight
  return new Date(from.getTime() + daysAhead * 864e5);
}

function fmtDate(d) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/* ---------------- Data ---------------- */
var PLANETS = [
  { id: "saturn", name: "Saturn", look: "Evening, low in the south-east", color: "radial-gradient(circle at 35% 35%, #f6e2a8, #c9a45c 60%, #8c6c32)", distance: "1.4 billion km", day: "10.7 hours", year: "29.5 years", moons: "146", tip: "Even a small telescope shows the rings. They are tilted almost edge-on in 2025 and 2026, so look for a thin bright line.", fact: "Saturn is less dense than water. It would float in a big enough bathtub." },
  { id: "jupiter", name: "Jupiter", look: "After midnight, rising in the east", color: "radial-gradient(circle at 35% 35%, #f3d9b8, #c8925f 55%, #8a5a38)", distance: "778 million km", day: "9.9 hours", year: "11.9 years", moons: "95", tip: "Hold binoculars steady against a wall: the four big moons appear as tiny dots in a line.", fact: "The Great Red Spot is a storm wider than Earth that has lasted for over 350 years." },
  { id: "venus", name: "Venus", look: "Before sunrise, low in the east", color: "radial-gradient(circle at 35% 35%, #fff7d6, #e8cf86 60%, #b59a4f)", distance: "108 million km", day: "243 Earth days", year: "225 days", moons: "0", tip: "The brightest point in the sky after the Moon. Through a telescope it shows phases, just like the Moon.", fact: "A day on Venus is longer than its year, and it spins backwards." },
  { id: "mars", name: "Mars", look: "Early morning, east", color: "radial-gradient(circle at 35% 35%, #ffb08a, #d0603a 55%, #8f3322)", distance: "228 million km", day: "24.6 hours", year: "687 days", moons: "2", tip: "Look for a steady orange point that doesn't twinkle like the stars around it.", fact: "Olympus Mons on Mars is about two and a half times taller than Mount Everest." },
  { id: "mercury", name: "Mercury", look: "Hard to spot, close to the Sun", color: "radial-gradient(circle at 35% 35%, #e1dfdc, #9b9792 60%, #5d5a57)", distance: "58 million km", day: "59 Earth days", year: "88 days", moons: "0", tip: "Only visible for a few weeks a year, just after sunset or before sunrise. Never point optics near the Sun.", fact: "Mercury has almost no atmosphere, so it swings from 430 °C in the day to -180 °C at night." }
];

function skyEvents(now) {
  var events = [
    { name: "Leonid meteor shower peak", date: new Date(2026, 10, 17), kind: "Meteor shower", text: "Up to 15 meteors an hour from the constellation Leo. Best after midnight, away from city lights." },
    { name: "Geminid meteor shower peak", date: new Date(2026, 11, 14), kind: "Meteor shower", text: "The best shower of the year: up to 120 bright, slow meteors an hour. Starts in the late evening." },
    { name: "December solstice", date: new Date(2026, 11, 21), kind: "Season", text: "The longest night of the year in the northern hemisphere, so the most time to observe." },
    { name: "Quadrantid meteor shower peak", date: new Date(2027, 0, 3), kind: "Meteor shower", text: "A short, sharp peak of up to 80 meteors an hour. Look north-east before dawn." },
    { name: "Lyrid meteor shower peak", date: new Date(2027, 3, 22), kind: "Meteor shower", text: "Around 18 meteors an hour, sometimes with bright fireballs. Best before dawn." },
    { name: "Next full moon", date: nextPhase(now, 0.5), kind: "Moon", text: "The Moon is opposite the Sun and fully lit. Great for photos, bad for faint galaxies." },
    { name: "Next new moon", date: nextPhase(now, 0), kind: "Moon", text: "The darkest sky of the month. Plan your deep-sky session for the nights around this date." }
  ];
  return events
    .filter(function (e) { return e.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()); })
    .sort(function (a, b) { return a.date - b.date; });
}

/* ---------------- Page: Tonight ---------------- */
function renderTonight() {
  var now = new Date();
  var moon = moonInfo(now);
  var darkness = Math.round((1 - moon.illumination) * 10);

  drawMoon(moon.fraction);
  $("#moon").attr("aria-label", moon.name + ", " + Math.round(moon.illumination * 100) + " percent lit");
  $("#tonightDate").text(now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
  $("#phaseName").text(moon.name);
  $("#phaseDetail").text(Math.round(moon.illumination * 100) + "% lit, " + Math.floor(moon.age) + " days old");
  $("#skyScore").text(darkness);
  $("#skyAdvice").text(
    darkness >= 7 ? "Dark skies. Good for galaxies, nebulae and meteors." :
    darkness >= 4 ? "Some moonlight. Planets and star clusters will still look great." :
    "Bright moonlight. Point the telescope at the Moon itself or the planets."
  );

  var $list = $("#planetsTonight");
  $list.children("li:not([data-role=list-divider])").remove();
  $.each(PLANETS.slice(0, 4), function (i, p) {
    $list.append(
      '<li><a href="#planet" class="has-dot" data-planet="' + p.id + '">' +
      '<span class="planet-dot" style="background:' + p.color + '"></span>' +
      "<h2>" + p.name + '</h2><p class="desc">' + p.look + "</p></a></li>"
    );
  });
  if ($list.hasClass("ui-listview")) $list.listview("refresh");
}

/* ---------------- Page: Events ---------------- */
function renderEvents() {
  var html = $.map(skyEvents(new Date()), function (e) {
    var days = Math.ceil((e.date - new Date()) / 864e5);
    var when = days <= 0 ? "Tonight" : days === 1 ? "Tomorrow" : "In " + days + " days";
    return '<div data-role="collapsible" data-filtertext="' + esc(e.name + " " + e.kind) + '">' +
      "<h3>" + esc(e.name) + '<span class="ui-li-count">' + when + "</span></h3>" +
      "<p><b>" + fmtDate(e.date) + "</b> (" + esc(e.kind) + ")</p><p>" + esc(e.text) + "</p></div>";
  }).join("");
  $("#eventList").html(html);
  if ($("#eventList").hasClass("ui-collapsible-set")) $("#eventList").collapsibleset("refresh").filterable("refresh");
}

/* ---------------- Page: Planets ---------------- */
function renderPlanets() {
  var html = $.map(PLANETS, function (p) {
    return '<li><a href="#planet" class="has-dot" data-planet="' + p.id + '">' +
      '<span class="planet-dot" style="background:' + p.color + '"></span>' +
      "<h2>" + p.name + '</h2><p class="desc">' + p.moons + " moons, a year lasts " + p.year + "</p></a></li>";
  }).join("");
  $("#planetList").html(html);
  if ($("#planetList").hasClass("ui-listview")) $("#planetList").listview("refresh");
}

var currentPlanet = PLANETS[0];
function renderPlanetDetail() {
  var p = currentPlanet;
  $("#planetTitle").text(p.name);
  $("#planetBody").html(
    '<div class="planet-hero" style="background:' + p.color + '" role="img" aria-label="Illustration of ' + p.name + '"></div>' +
    '<p class="tip"><b>Where to look:</b> ' + p.look + "</p>" +
    '<div class="facts">' +
    "<div><span>Distance from Sun</span><b>" + p.distance + "</b></div>" +
    "<div><span>Length of a day</span><b>" + p.day + "</b></div>" +
    "<div><span>Length of a year</span><b>" + p.year + "</b></div>" +
    "<div><span>Known moons</span><b>" + p.moons + "</b></div></div>" +
    "<h3>Observing tip</h3><p>" + p.tip + "</p><h3>Did you know?</h3><p>" + p.fact + "</p>" +
    '<a href="#log" class="ui-btn ui-corner-all cta" data-transition="slideup" id="logThisPlanet">Log an observation of ' + p.name + "</a>"
  );
}

/* ---------------- Page: Log ---------------- */
var deleteIndex = null;

function renderLog() {
  var log = store.get("stargazer-log", []);
  var $list = $("#logList");
  if (!log.length) {
    $list.html('<li class="empty-log">No observations yet. Your first one will show up here.</li>');
  } else {
    $list.html('<li data-role="list-divider">Your observations<span class="ui-li-count">' + log.length + "</span></li>" +
      $.map(log, function (o, i) {
        return '<li><a href="#" class="noop"><h2>' + esc(o.target) + "</h2>" +
          '<p><span class="stars" aria-label="Seeing ' + o.seeing + ' out of 5">' + new Array(+o.seeing + 1).join("★") + new Array(6 - o.seeing).join("☆") + "</span> with " + esc(o.gear) + "</p>" +
          (o.notes ? '<p class="desc">' + esc(o.notes) + "</p>" : "") +
          '<p class="ui-li-aside">' + new Date(o.date + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + "</p></a>" +
          '<a href="#confirmDelete" data-rel="popup" data-position-to="window" data-transition="pop" class="del" data-index="' + i + '">Delete</a></li>';
      }).join(""));
  }
  if ($list.hasClass("ui-listview")) $list.listview("refresh");
}

/* ---------------- Wiring ---------------- */
$(document).on("pagecreate", "#tonight", renderTonight);
$(document).on("pagecreate", "#events", renderEvents);
$(document).on("pagecreate", "#planets", renderPlanets);
$(document).on("pagebeforeshow", "#planet", renderPlanetDetail);
$(document).on("pagecreate", "#log", function () {
  $("#obsDate").val(new Date().toISOString().slice(0, 10));
  renderLog();
});

// Remember which planet was tapped before the detail page opens
$(document).on("click", "[data-planet]", function () {
  var id = $(this).data("planet");
  currentPlanet = $.grep(PLANETS, function (p) { return p.id === id; })[0];
});

$(document).on("click", "#logThisPlanet", function () {
  var target = currentPlanet.name;
  setTimeout(function () { $("#target").val(target).selectmenu("refresh"); }, 50);
});

$(document).on("submit", "#logForm", function (e) {
  e.preventDefault();
  var date = $("#obsDate").val();
  if (!date || new Date(date) > new Date()) {
    alert("Pick today's date or a date in the past.");
    return;
  }
  var log = store.get("stargazer-log", []);
  log.unshift({
    target: $("#target").val(),
    date: date,
    seeing: $("#seeing").val(),
    gear: $("input[name=gear]:checked").val(),
    notes: $.trim($("#notes").val())
  });
  store.set("stargazer-log", log);
  $("#notes").val("");
  renderLog();
  $("html, body").animate({ scrollTop: $("#logList").offset().top - 70 }, 300);
});

$(document).on("click", "#logList .del", function () {
  deleteIndex = $(this).data("index");
  var o = store.get("stargazer-log", [])[deleteIndex];
  $("#deleteWhat").text(o ? o.target + " on " + o.date : "");
});

$(document).on("click", "#confirmDeleteBtn", function (e) {
  e.preventDefault();
  var log = store.get("stargazer-log", []);
  log.splice(deleteIndex, 1);
  store.set("stargazer-log", log);
  $("#confirmDelete").popup("close");
  renderLog();
});

$(document).on("click", "#logList .noop", function (e) { e.preventDefault(); });

// The settings panel lives outside the pages, so it must be enhanced by hand
$(function () {
  $("#settings").panel().enhanceWithin();

  var night = store.get("stargazer-night", false);
  $("html").toggleClass("night-vision", night);
  $("#nightVision").val(night ? "on" : "off").flipswitch("refresh");

  var city = store.get("stargazer-city", "Pune");
  $("#city").val(city).selectmenu("refresh");
  $(".cityName").text(city);

  $("#nightVision").on("change", function () {
    var on = $(this).val() === "on";
    $("html").toggleClass("night-vision", on);
    store.set("stargazer-night", on);
  });

  $("#city").on("change", function () {
    store.set("stargazer-city", $(this).val());
    $(".cityName").text($(this).val());
  });
});
