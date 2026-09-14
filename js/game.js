(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const verseLabel = document.getElementById("verseName");
  const lootHud = document.getElementById("lootHud");
  const lobbyEl = document.getElementById("lobby");
  const playEl = document.getElementById("play");
  const user = window.EVAuth && EVAuth.current();
  const SAVE_KEY = "endless-verses-pixel-" + (user ? user.name : "guest");

  const W = 320, H = 180, T = 16;
  const keys = {};
  const player = { x: 40, y: 116, vx: 0, w: 12, h: 20, dir: 1 };
  const chest = { x: 148, y: 108, w: 28, h: 24, open: false, glow: 0 };
  let gold = 0;
  let playing = false;
  let verseId = "hub";
  let coins = [];

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      if (typeof data.x === "number") player.x = data.x;
      if (typeof data.gold === "number") gold = data.gold;
      if (data.verse) verseId = data.verse;
    } catch (e) {}
  }
  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ x: player.x, gold: gold, verse: verseId }));
  }

  function startGame() {
    playing = true;
    lobbyEl.classList.add("off");
    playEl.classList.add("on");
    last = performance.now();
  }
  function toMenu() {
    save();
    playing = false;
    playEl.classList.remove("on");
    lobbyEl.classList.remove("off");
  }

  function nearChest() {
    return Math.abs(player.x + player.w / 2 - (chest.x + chest.w / 2)) < 22;
  }
  function openChest() {
    if (!nearChest()) return;
    chest.open = true;
    chest.glow = 1;
    const n = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      coins.push({
        x: chest.x + 10,
        y: chest.y + 4,
        vx: -1.2 + Math.random() * 2.4,
        vy: -2.2 - Math.random() * 1.4,
        life: 1
      });
    }
    gold += n * 3;
    save();
  }

  window.addEventListener("keydown", (e) => {
    if (!playing) return;
    keys[e.code] = true;
    if (e.code === "KeyE") openChest();
  });
  window.addEventListener("keyup", (e) => { keys[e.code] = false; });
  canvas.addEventListener("click", function (e) {
    if (!playing) return;
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    if (x > chest.x && x < chest.x + chest.w && y > chest.y && y < chest.y + chest.h) openChest();
  });

  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("startSide").onclick = startGame;
  document.getElementById("pickHub").onclick = function () { verseId = "hub"; save(); };
  document.getElementById("pickSoul").onclick = function () { verseId = "soul"; save(); };
  document.getElementById("toMenu").onclick = toMenu;
  document.getElementById("logoutPlay").onclick = function () {
    save(); EVAuth.logout(); location.href = "index.html";
  };

  function px(x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x | 0, y | 0, w, h);
  }

  function stoneTile(x, y, shade) {
    const base = shade ? "#6d675c" : "#5a554c";
    px(x, y, T, T, base);
    px(x, y, T, 1, "#8a8376");
    px(x, y + T - 1, T, 1, "#3c3933");
    px(x, y, 1, T, "#7a7468");
    px(x + T - 1, y, 1, T, "#3c3933");
    px(x + 4, y + 5, 3, 2, "#4a463e");
  }

  function drawChest() {
    const x = chest.x, y = chest.y;
    if (chest.glow > 0) {
      px(x - 6, y - 8, chest.w + 12, chest.h + 14, "rgba(255,190,60," + (chest.glow * 0.18) + ")");
    }
    px(x + 2, y + 10, 24, 14, "#7a3e12");
    px(x + 2, y + 10, 24, 3, "#d4a03a");
    px(x + 1, y + 22, 26, 3, "#4a2408");
    px(x + 3, y + (chest.open ? 2 : 6), 22, 10, "#c47a22");
    px(x + 3, y + (chest.open ? 2 : 6), 22, 3, "#f0c45a");
    px(x + 12, y + 12, 5, 6, "#2a2a32");
    px(x + 13, y + 13, 3, 3, "#8a8a9a");
    ctx.fillStyle = "#ffcf5a";
    ctx.font = "bold 8px monospace";
    ctx.fillText("LOOT", x + 4, y - 3);
  }

  function drawPlayer() {
    const x = player.x | 0, y = player.y | 0;
    px(x + 3, y, 6, 6, "#f0d2a0");
    px(x + 2, y + 6, 8, 8, "#3a5a9a");
    px(x + 1, y + 7, 3, 7, "#2a3a6a");
    px(x + 8, y + 7, 3, 7, "#2a3a6a");
    px(x + 3, y + 14, 3, 6, "#2a2a38");
    px(x + 7, y + 14, 3, 6, "#2a2a38");
    if (player.dir < 0) px(x + 3, y + 2, 2, 2, "#1a1a20");
    else px(x + 7, y + 2, 2, 2, "#1a1a20");
  }

  function drawWorld() {
    px(0, 0, W, H, verseId === "soul" ? "#2a2030" : "#3a3630");
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 20; x++) stoneTile(x * T, y * T, (x + y) % 2 === 0);
    }
    for (let x = 0; x < 20; x++) {
      stoneTile(x * T, 136, x % 2 === 0);
      stoneTile(x * T, 152, x % 2 !== 0);
      stoneTile(x * T, 168, x % 2 === 0);
    }
    px(0, 132, W, 3, "#2a2620");
    drawChest();
    coins.forEach((c) => {
      px(c.x, c.y, 3, 3, "#ffcf5a");
    });
    drawPlayer();
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (playing) {
      const left = keys.ArrowLeft || keys.KeyA;
      const right = keys.ArrowRight || keys.KeyD;
      player.vx = (right ? 70 : 0) - (left ? 70 : 0);
      if (player.vx) player.dir = player.vx > 0 ? 1 : -1;
      player.x += player.vx * dt;
      if (player.x < 8) player.x = 8;
      if (player.x > W - 20) player.x = W - 20;
      chest.glow = Math.max(0, chest.glow - dt * 0.7);
      coins = coins.filter((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 8 * dt;
        c.life -= dt;
        return c.life > 0 && c.y < 160;
      });
      drawWorld();
      lootHud.textContent = "GOLD " + gold;
      verseLabel.textContent = verseId === "soul" ? "Soul-Keller" : "Steingang";
    }
    requestAnimationFrame(tick);
  }

  load();
  requestAnimationFrame(tick);
  window.addEventListener("beforeunload", save);
})();
