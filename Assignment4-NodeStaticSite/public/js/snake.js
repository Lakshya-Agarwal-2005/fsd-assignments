// Snake on the "Pixel Boy" handheld (home page)
(() => {
  const canvas = document.getElementById("game");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const CELLS = 20;
  const SIZE = canvas.width / CELLS;
  const COLORS = { bg: "#9bbc0f", light: "#8bac0f", mid: "#306230", dark: "#0f380f" };
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };

  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("startBtn");

  let snake, dir, nextDir, food, score, timer, running = false;
  let best = 0;
  try { best = Number(localStorage.getItem("pixelpit-best")) || 0; } catch { /* storage blocked */ }
  bestEl.textContent = best;

  function placeFood() {
    do {
      food = [Math.floor(Math.random() * CELLS), Math.floor(Math.random() * CELLS)];
    } while (snake.some(([x, y]) => x === food[0] && y === food[1]));
  }

  function cell(x, y, color, inset = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SIZE + inset, y * SIZE + inset, SIZE - inset * 2, SIZE - inset * 2);
  }

  function draw() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < CELLS; x++) for (let y = 0; y < CELLS; y++) if ((x + y) % 2) cell(x, y, COLORS.light, 0);
    cell(food[0], food[1], COLORS.mid, 3);
    snake.forEach(([x, y], i) => cell(x, y, i === 0 ? COLORS.dark : COLORS.mid));
  }

  function text(lines) {
    ctx.fillStyle = "rgba(155,188,15,.85)";
    ctx.fillRect(0, canvas.height / 2 - 34, canvas.width, 68);
    ctx.fillStyle = COLORS.dark;
    ctx.textAlign = "center";
    lines.forEach((l, i) => {
      ctx.font = `${i ? 9 : 14}px "Press Start 2P", monospace`;
      ctx.fillText(l, canvas.width / 2, canvas.height / 2 - 6 + i * 22);
    });
  }

  function reset() {
    snake = [[8, 10], [7, 10], [6, 10]];
    dir = nextDir = "right";
    score = 0;
    scoreEl.textContent = 0;
    placeFood();
  }

  function step() {
    dir = nextDir;
    const [dx, dy] = DIRS[dir];
    const head = [snake[0][0] + dx, snake[0][1] + dy];
    const hitWall = head[0] < 0 || head[1] < 0 || head[0] >= CELLS || head[1] >= CELLS;
    const hitSelf = snake.some(([x, y]) => x === head[0] && y === head[1]);
    if (hitWall || hitSelf) return gameOver();

    snake.unshift(head);
    if (head[0] === food[0] && head[1] === food[1]) {
      score += 10;
      scoreEl.textContent = score;
      placeFood();
      clearInterval(timer);
      timer = setInterval(step, Math.max(60, 140 - snake.length * 2)); // speed up as it grows
    } else {
      snake.pop();
    }
    draw();
  }

  function start() {
    reset();
    running = true;
    statusEl.textContent = "Playing";
    startBtn.textContent = "RESET";
    clearInterval(timer);
    timer = setInterval(step, 140);
    draw();
  }

  function gameOver() {
    clearInterval(timer);
    running = false;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      try { localStorage.setItem("pixelpit-best", best); } catch { /* storage blocked */ }
    }
    draw();
    text(["GAME OVER", `SCORE ${score}`]);
    statusEl.textContent = score && score === best ? "New high score!" : "Press Start";
    startBtn.textContent = "START";
  }

  function turn(newDir) {
    const opposite = { up: "down", down: "up", left: "right", right: "left" };
    if (newDir && newDir !== opposite[dir]) nextDir = newDir;
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === " " && document.activeElement === document.body) {
      e.preventDefault();
      start();
    }
    if (running && KEYS[e.key]) {
      e.preventDefault(); // stop the page from scrolling while playing
      turn(KEYS[e.key]);
    }
  });

  document.querySelectorAll("[data-dir]").forEach((b) => b.addEventListener("click", () => (running ? turn(b.dataset.dir) : start())));
  startBtn.addEventListener("click", start);

  // Swipe controls on touch screens
  let touchStart = null;
  canvas.addEventListener("touchstart", (e) => (touchStart = [e.touches[0].clientX, e.touches[0].clientY]), { passive: true });
  canvas.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart[0];
    const dy = e.changedTouches[0].clientY - touchStart[1];
    if (!running) return start();
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  });

  reset();
  draw();
  document.fonts.ready.then(() => text(["PIXEL PIT", "PRESS START"]));
})();
