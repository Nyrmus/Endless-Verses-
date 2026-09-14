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

  const W = 480, H = 270, T = 16;
  const keys = {};
  const player = { x: 64, y: 186, vx: 0, w: 14, h: 22, dir: 1, walk: 0 };
  const chest = { x: 208, y: 168, w: 64, h: 44, open: false, glow: 0, bounce: 0 };
  let gold = 0;
  let playing = false;
  let verseId = "hub";
  let coins = [];
  let sparks = [];
  let t = 0;

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
    const cx = chest.x + chest.w / 2;
    return Math.abs(player.x + player.w / 2 - cx) < 42;
  }
  function openChest() {
    if (!nearChest()) return;
    chest.open = true;
    chest.glow = 1;
    chest.bounce = 1;
    const n = 7 + Math.floor(Math.random() * 6);
    for (let i = 0; i < n; i++) {
      coins.push({
        x: chest.x + 28 + Math.random() * 8,
        y: chest.y + 10,
        vx: -2.4 + Math.random() * 4.8,
        vy: -3.4 - Math.random() * 2,
        life: 1.2,
        s: 3 + (Math.random() * 2 | 0)
      });
    }
    gold += n * 5;
    save();
  }

  window.addEventListener("keydown", (e) => {
    if (!playing) return;
    keys[e.code] = true;
    if (e.code === "KeyE" || e.code === "Space") {
      e.preventDefault();
      openChest();
    }
  });
  window.addEventListener("keyup", (e) => { keys[e.code] = false; });
  canvas.addEventListener("click", function (e) {
    if (!playing) return;
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    if (x > chest.x - 4 && x < chest.x + chest.w + 4 && y > chest.y - 20 && y < chest.y + chest.h + 8) openChest();
  });

  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("startSide").onclick = startGame;
  document.getElementById("pickHub").onclick = function () { verseId = "hub"; save(); };
  document.getElementById("pickSoul").onclick = function () { verseId = "soul"; save(); };
  document.getElementById("toMenu").onclick = toMenu;
  document.getElementById("logoutPlay").onclick = function () {
    save(); EVAuth.logout(); location.href = "index.html";
  };

  const C = {
    mortar: "#2b2a28",
    brickA: "#6f6a61",
    brickB: "#5d5850",
    brickC: "#7a746a",
    brickD: "#4a463f",
    hi: "#9a9488",
    lo: "#3a3732",
    moss: "#3f5a32",
    wood: "#6b3e1c",
    woodHi: "#8a5528",
    woodLo: "#3d220e",
    gold: "#f0c45a",
    goldHi: "#ffe08a",
    goldLo: "#b07818",
    brown: "#a85a1c",
    brownHi: "#d47a28",
    brownLo: "#6a3010",
    lock: "#3a3a44",
    lockHi: "#8a8a98"
  };

  function px(x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x | 0, y | 0, w, h);
  }

  function brick(x, y, w, h, variant) {
    const base = variant === 1 ? C.brickB : variant === 2 ? C.brickC : variant === 3 ? C.brickD : C.brickA;
    px(x, y, w, h, base);
    px(x, y, w, 1, C.hi);
    px(x, y + h - 1, w, 1, C.lo);
    px(x, y, 1, h, C.hi);
    px(x + w - 1, y, 1, h, C.lo);
    if (variant === 2) px(x + 3, y + 4, 4, 2, C.lo);
    if (variant === 3) px(x + w - 7, y + h - 6, 5, 2, C.moss);
  }

  function drawWalls() {
    px(0, 0, W, H, "#1e1c1a");
    const rows = [
      [0, 8], [8, 12], [0, 10], [6, 14], [0, 9], [10, 11], [0, 8], [7, 13],
      [0, 10], [5, 12], [0, 9], [8, 14]
    ];
    let y = 8;
    for (let r = 0; r < 11; r++) {
      const odd = r % 2;
      let x = odd ? -10 : 0;
      let i = 0;
      while (x < W + 8) {
        const w = 18 + ((i * 7 + r * 3) % 5) * 2;
        const v = (i + r * 2) % 4;
        brick(x, y, w, 14, v);
        px(x - 1, y, 2, 14, C.mortar);
        x += w + 1;
        i++;
      }
      px(0, y + 14, W, 2, C.mortar);
      y += 16;
    }

    function niche(nx, ny, nw, nh) {
      px(nx, ny, nw, nh, "#161412");
      px(nx, ny, nw, 2, C.lo);
      px(nx, ny, 2, nh, C.lo);
      px(nx + nw - 2, ny, 2, nh, C.hi);
      px(nx + 3, ny + 3, nw - 6, nh - 6, "#0e0d0c");
    }
    niche(28, 48, 46, 58);
    niche(406, 48, 46, 58);
    niche(88, 96, 28, 22);
    niche(364, 96, 28, 22);

    drawTorch(48, 62);
    drawTorch(426, 62);

    px(0, 184, W, 6, C.woodLo);
    for (let x = 0; x < W; x += 16) {
      px(x, 186, 15, 4, C.wood);
      px(x, 186, 15, 1, C.woodHi);
      px(x + 15, 186, 1, 4, C.woodLo);
    }
    for (let x = 0; x < W; x += T) {
      brick(x, 190, T, T, x % 32 === 0 ? 1 : 0);
      brick(x, 206, T, T, x % 32 === 16 ? 2 : 3);
      brick(x, 222, T, T, x % 48 === 0 ? 0 : 1);
      brick(x, 238, T, T, 3);
      brick(x, 254, T, T, 1);
    }
    px(0, 184, W, 1, "#1a1816");

    px(140, 40, 3, 12, "#4a3a28");
    px(138, 50, 8, 4, C.moss);
    px(330, 72, 2, 18, "#3a4a28");
    px(328, 88, 10, 3, C.moss);
  }

  function drawTorch(x, y) {
    const flick = 0.7 + Math.sin(t * 11 + x) * 0.3;
    px(x - 2, y + 16, 8, 4, "#4a3220");
    px(x, y + 6, 4, 12, "#6a4a28");
    px(x - 3, y - 2, 10, 10, "rgba(255,140,40," + (0.18 * flick) + ")");
    px(x, y, 4, 7, "#ffb040");
    px(x + 1, y + 1, 2, 4, "#ffe08a");
    px(x + 1, y - 2, 2, 3, "#fff2c0");
    if (Math.random() > 0.7) {
      sparks.push({ x: x + 1, y: y - 2, vx: -0.3 + Math.random() * 0.6, vy: -0.6, life: 0.4 });
    }
  }

  function drawTitle() {
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    const tx = W / 2, ty = 36;
    ctx.fillStyle = "#3a2208";
    ctx.fillText("LOOT SAVINGS", tx + 2, ty + 2);
    ctx.fillStyle = "#ffcf5a";
    ctx.fillText("LOOT SAVINGS", tx, ty);
    ctx.fillStyle = "#ffe9a0";
    ctx.fillText("LOOT SAVINGS", tx, ty - 1);
    ctx.textAlign = "left";
  }

  function drawChest() {
    const bob = Math.sin(t * 2) * 0.6 + chest.bounce * -3;
    const x = chest.x | 0;
    const y = (chest.y + bob) | 0;
    if (chest.glow > 0) {
      px(x - 14, y - 12, chest.w + 28, chest.h + 28, "rgba(255,190,50," + (chest.glow * 0.16) + ")");
      px(x - 6, y - 4, chest.w + 12, chest.h + 12, "rgba(255,210,80," + (chest.glow * 0.12) + ")");
    }
    px(x + 8, y + 40, 48, 6, "rgba(0,0,0,0.35)");

    px(x + 4, y + 18, 56, 24, C.brownLo);
    px(x + 6, y + 18, 52, 22, C.brown);
    px(x + 6, y + 18, 52, 3, C.brownHi);
    px(x + 6, y + 36, 52, 2, C.brownLo);

    const lidY = chest.open ? y + 2 : y + 8;
    px(x + 6, lidY, 52, 14, C.brownHi);
    px(x + 6, lidY, 52, 3, C.goldHi);
    px(x + 8, lidY + 3, 48, 9, C.brown);
    px(x + 6, lidY + 13, 52, 3, C.gold);

    px(x + 6, y + 18, 52, 3, C.gold);
    px(x + 6, y + 32, 52, 3, C.goldLo);
    px(x + 8, y + 18, 3, 22, C.goldLo);
    px(x + 53, y + 18, 3, 22, C.gold);

    px(x + 10, lidY + 5, 3, 6, C.goldHi);
    px(x + 51, lidY + 5, 3, 6, C.goldHi);
    px(x + 24, y + 24, 4, 8, C.goldHi);
    px(x + 36, y + 24, 4, 8, C.goldHi);

    px(x + 28, y + 20, 8, 12, C.lock);
    px(x + 29, y + 21, 6, 5, C.lockHi);
    px(x + 31, y + 27, 2, 3, "#1a1a20");
    px(x + 30, y + 22, 4, 3, "#c8c8d4");
  }

  function drawPlayer() {
    const moving = Math.abs(player.vx) > 1;
    const step = moving ? ((player.walk * 8) | 0) % 2 : 0;
    const x = player.x | 0;
    const y = player.y | 0;
    const f = player.dir < 0;
    px(x + 2, y + 20, 10, 3, "rgba(0,0,0,0.35)");
    px(x + 4, y, 7, 7, "#e8c090");
    px(x + 4, y, 7, 2, "#2a2438");
    px(x + (f ? 5 : 8), y + 3, 2, 2, "#1a1a20");
    px(x + 3, y + 7, 9, 9, "#3d5f9c");
    px(x + 3, y + 7, 9, 2, "#2a446e");
    px(x + (f ? 1 : 11), y + 8, 3, 7, "#2c3f68");
    px(x + 4, y + 16, 3, 6 + step, "#2a2a38");
    px(x + 8, y + 16, 3, 6 + (1 - step), "#222230");
    px(x + 4, y + 20 + step, 3, 2, "#4a3020");
    px(x + 8, y + 20 + (1 - step), 3, 2, "#4a3020");
  }

  function drawCoins() {
    coins.forEach((c) => {
      px(c.x, c.y, c.s, c.s, C.goldHi);
      px(c.x + 1, c.y + 1, c.s - 2, c.s - 2, C.gold);
    });
    sparks.forEach((s) => {
      px(s.x, s.y, 2, 2, "#ffb060");
    });
  }

  function drawHint() {
    if (!nearChest()) return;
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "#ffe08a";
    ctx.textAlign = "center";
    ctx.fillText("E  ÖFFNEN", chest.x + 32, chest.y - 10);
    ctx.textAlign = "left";
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    t += dt;
    if (playing) {
      const left = keys.ArrowLeft || keys.KeyA;
      const right = keys.ArrowRight || keys.KeyD;
      player.vx = (right ? 86 : 0) - (left ? 86 : 0);
      if (player.vx) {
        player.dir = player.vx > 0 ? 1 : -1;
        player.walk += dt;
      }
      player.x += player.vx * dt;
      if (player.x < 16) player.x = 16;
      if (player.x > W - 30) player.x = W - 30;
      chest.glow = Math.max(0, chest.glow - dt * 0.55);
      chest.bounce = Math.max(0, chest.bounce - dt * 3);
      coins = coins.filter((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 10 * dt;
        c.life -= dt;
        return c.life > 0 && c.y < 210;
      });
      sparks = sparks.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= dt;
        return s.life > 0;
      });
      drawWalls();
      drawTitle();
      drawChest();
      drawCoins();
      drawPlayer();
      drawHint();
      lootHud.textContent = "GOLD " + gold;
      verseLabel.textContent = verseId === "soul" ? "Soul-Keller" : "Steingang";
    }
    requestAnimationFrame(tick);
  }

  load();
  requestAnimationFrame(tick);
  window.addEventListener("beforeunload", save);
})();
