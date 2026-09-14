(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const verseLabel = document.getElementById("verseName");
  const lootHud = document.getElementById("lootHud");
  const stamHud = document.getElementById("stamHud");
  const hpHud = document.getElementById("hpHud");
  const lobbyEl = document.getElementById("lobby");
  const playEl = document.getElementById("play");
  const user = window.EVAuth && EVAuth.current();
  const SAVE = "endless-verses-run-" + (user ? user.name : "guest");
  const keys = {};
  const ninja = new EVNinja({ x: 280, y: 420, scale: 1.55 });
  const knives = [];
  const embers = [];
  let gold = 0;
  let hp = 100;
  let playing = false;
  let cam = 0;
  let W = 1280, H = 720, floor = 480;
  let tWorld = 0;
  let invuln = 0;

  const foes = [
    new EVEnemy({ id: "ashwraith", name: "Ashwraith", x: 780, y: 420, hp: 80, atk: 14, range: 72, scale: 1.25 }),
    new EVEnemy({ id: "ironbell", name: "Ironbell", x: 1280, y: 420, hp: 220, atk: 22, range: 92, scale: 1.45 }),
    new EVEnemy({ id: "silkfang", name: "Silkfang", x: 1760, y: 420, hp: 70, atk: 16, range: 66, scale: 1.2 })
  ];

  function resize() {
    W = Math.max(960, window.innerWidth);
    H = Math.max(540, window.innerHeight);
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    floor = Math.floor(H * 0.72);
    if (ninja.onGround) ninja.y = floor;
    foes.forEach((f) => { f.y = floor; });
  }
  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < 50; i++) {
    embers.push({ x: Math.random() * 2600, y: Math.random() * 720, s: 0.7 + Math.random() * 2, v: 10 + Math.random() * 24, a: 0.2 + Math.random() * 0.4 });
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE) || "{}");
      if (typeof d.gold === "number") gold = d.gold;
    } catch (e) {}
  }
  function save() {
    localStorage.setItem(SAVE, JSON.stringify({ gold: gold, x: ninja.x }));
  }

  window.EVGame = {
    start: function () {
      resize();
      hp = 100;
      playing = true;
      last = performance.now();
      EV.audio.start();
    },
    stop: function () {
      save();
      playing = false;
      playEl.classList.remove("on");
      lobbyEl.classList.remove("off");
    }
  };

  window.addEventListener("keydown", function (e) {
    if (!playing) return;
    keys[e.code] = true;
    if (["Space", "ArrowUp"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyQ") ninja.dash();
    if (e.code === "KeyR") ninja.parry();
    if (e.code === "KeyF" || e.code === "KeyJ") {
      const r = ninja.throwKnife();
      if (r === "throw") knives.push({ x: ninja.x + ninja.dir * 40, y: ninja.y - 110, vx: ninja.dir * 520, life: 0.75, hit: false });
    }
  });
  window.addEventListener("keyup", function (e) { keys[e.code] = false; });

  document.getElementById("toMenu").onclick = function () { EVGame.stop(); };
  document.getElementById("logoutPlay").onclick = function () {
    save(); EVAuth.logout(); location.href = "index.html";
  };

  function pillar(x, top, bot, w) {
    ctx.fillStyle = "#1b1624";
    ctx.fillRect(x, top, w, bot - top);
    ctx.fillStyle = "#2a2436";
    ctx.fillRect(x + 6, top, 4, bot - top);
    ctx.fillStyle = "#0e0c14";
    ctx.fillRect(x + w - 8, top, 8, bot - top);
    ctx.fillStyle = "#3a3248";
    ctx.fillRect(x - 8, top, w + 16, 14);
    ctx.fillRect(x - 10, bot - 18, w + 20, 18);
    const flick = 0.35 + Math.sin(tWorld * 8 + x) * 0.2;
    ctx.fillStyle = "rgba(255,160,70," + (0.16 * flick) + ")";
    ctx.beginPath();
    ctx.arc(x + w * 0.5, top + 48, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c47a28";
    ctx.fillRect(x + w * 0.5 - 3, top + 28, 6, 16);
    ctx.fillStyle = "#ffcc77";
    ctx.fillRect(x + w * 0.5 - 2, top + 24, 4, 8);
  }

  function world() {
    const sky = ctx.createLinearGradient(0, 0, 0, floor);
    sky.addColorStop(0, "#140e1c");
    sky.addColorStop(0.45, "#1c1428");
    sky.addColorStop(1, "#2a1c14");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const arena = window.EVArt && EVArt.imgs && EVArt.imgs.arena;
    if (arena && arena.width) {
      const ih = floor + 40;
      const iw = arena.width * (ih / arena.height);
      const mid = -((cam * 0.35) % iw);
      ctx.globalAlpha = 0.92;
      for (let x = mid - iw; x < W + iw; x += iw) ctx.drawImage(arena, x, 0, iw, ih);
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#0c0a12";
    ctx.fillRect(0, 0, W, 56);
    for (let i = 0; i < 12; i++) {
      const bx = ((i * 160 - cam * 0.25) % (W + 160));
      ctx.fillStyle = "#16121c";
      ctx.fillRect(bx, 48, 140, 18);
    }

    const backY = 70;
    for (let i = -1; i < 10; i++) {
      const px = ((i * 220 - cam * 0.22) % (W + 220));
      ctx.fillStyle = "rgba(32,24,48,0.55)";
      ctx.fillRect(px, backY, 70, floor - backY);
    }

    for (let i = -1; i < 8; i++) {
      const px = ((i * 280 - cam * 0.55) % (W + 280));
      pillar(px, 64, floor, 52);
    }

    ctx.fillStyle = "#1a1410";
    ctx.fillRect(0, floor, W, H - floor);
    for (let i = 0; i < 16; i++) {
      const tx = ((i * 90 - cam * 0.7) % (W + 90));
      ctx.fillStyle = i % 2 ? "#241c18" : "#1e1814";
      ctx.fillRect(tx, floor + 8, 86, H - floor);
    }
    ctx.fillStyle = "rgba(210,160,80,0.28)";
    ctx.fillRect(0, floor, W, 3);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, floor + 3, W, 10);

    const glow = ctx.createRadialGradient(W * 0.5, floor - 40, 20, W * 0.5, floor, W * 0.7);
    glow.addColorStop(0, "rgba(255,140,50,0.08)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const vig = ctx.createRadialGradient(W * 0.5, H * 0.55, H * 0.15, W * 0.5, H * 0.5, H * 0.8);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  function hurtPlayer(dmg, x, y) {
    if (invuln > 0) return;
    if (ninja.state === "parry") {
      EVCombat.burst(x, y, "#c9b6ff", 18);
      if (EV.audio) EV.audio.parry();
      return;
    }
    hp = Math.max(0, hp - dmg);
    invuln = 0.55;
    EVCombat.burst(ninja.x, ninja.y - 90, "#ff6b4a", 16);
    if (EV.audio) EV.audio.whoosh();
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (playing) {
      tWorld += dt;
      invuln = Math.max(0, invuln - dt);
      const left = keys.KeyA || keys.ArrowLeft;
      const right = keys.KeyD || keys.ArrowRight;
      const jump = keys.Space || keys.KeyW || keys.ArrowUp;
      if (ninja.state !== "parry" && ninja.state !== "dash") {
        ninja.vx = (right ? 220 : 0) - (left ? 220 : 0);
        if (ninja.vx) ninja.dir = ninja.vx > 0 ? 1 : -1;
      }
      if (jump && ninja.onGround && ninja.state !== "parry") {
        ninja.vy = -640;
        ninja.onGround = false;
      }
      ninja.vy += 1750 * dt;
      ninja.x += ninja.vx * dt;
      ninja.y += ninja.vy * dt;
      if (ninja.x < 80) ninja.x = 80;
      if (ninja.x > 2400) ninja.x = 2400;
      if (ninja.y >= floor) { ninja.y = floor; ninja.vy = 0; ninja.onGround = true; }
      ninja.update(dt, { run: Math.abs(ninja.vx) > 20 && ninja.onGround });
      cam = EV.parts.lerp(cam, ninja.x - W * 0.38, 0.08);

      foes.forEach((f) => {
        const act = f.update(dt, ninja);
        if (act === "strike") hurtPlayer(f.atk, f.x + f.dir * 20, f.y - 90);
      });

      knives.forEach((k) => {
        k.x += k.vx * dt;
        k.life -= dt;
        if (k.hit) return;
        foes.forEach((f) => {
          if (f.dead || k.hit) return;
          if (Math.abs(k.x - f.x) < 40 && Math.abs(k.y - (f.y - 80)) < 100) {
            k.hit = true; k.life = 0;
            f.hit(18);
            EVCombat.burst(f.x, f.y - 90, "#ffe08a", 20);
            if (f.dead) gold += 25;
            if (EV.audio) EV.audio.coin();
          }
        });
      });
      for (let i = knives.length - 1; i >= 0; i--) if (knives[i].life <= 0) knives.splice(i, 1);
      EVCombat.update(dt);

      world();
      embers.forEach((e) => {
        e.y -= e.v * dt;
        if (e.y < 40) { e.y = floor - 10; e.x = cam * 0.4 + Math.random() * W; }
        ctx.fillStyle = "rgba(255,160,60," + e.a + ")";
        ctx.beginPath(); ctx.arc(e.x - cam * 0.5, e.y, e.s, 0, Math.PI * 2); ctx.fill();
      });
      ctx.save();
      ctx.translate(-cam, 0);
      foes.forEach((f) => f.draw(ctx));
      knives.forEach((k) => {
        ctx.save();
        ctx.translate(k.x, k.y);
        ctx.rotate(k.vx > 0 ? 0.15 : Math.PI - 0.15);
        ctx.fillStyle = "#f3efe6"; ctx.fillRect(0, -2, 18, 3);
        ctx.fillStyle = "#c9a24a"; ctx.fillRect(0, -3, 4, 5);
        ctx.restore();
      });
      ninja.draw(ctx, (EVLoadout.get().weapon || "blade"));
      EVCombat.draw(ctx);
      ctx.restore();

      lootHud.textContent = "GOLD " + gold + " · Messer " + ninja.knives;
      stamHud.style.width = ninja.stamina + "%";
      if (hpHud) hpHud.style.width = hp + "%";
      verseLabel.textContent = ninja.state === "parry" ? "PARRY" : "TEMPEL · SHADOW HALL";
    }
    requestAnimationFrame(tick);
  }
  load();
  requestAnimationFrame(tick);
  window.addEventListener("beforeunload", save);
})();
