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
  const ninja = new EVNinja({ x: 280, y: 500, scale: 1.22 });
  const knives = [];
  const embers = [];
  let gold = 0;
  let hp = 100;
  let playing = false;
  let cam = 0;
  let W = 1280, H = 720, floor = 600;
  let tWorld = 0;
  let invuln = 0;

  const foes = [
    new EVEnemy({ id: "ashwraith", name: "Ashwraith", x: 780, y: 500, hp: 80, atk: 14, range: 64, scale: 1.05 }),
    new EVEnemy({ id: "ironbell", name: "Ironbell", x: 1280, y: 500, hp: 220, atk: 22, range: 84, scale: 1.2 }),
    new EVEnemy({ id: "silkfang", name: "Silkfang", x: 1760, y: 500, hp: 70, atk: 16, range: 58, scale: 1.0 })
  ];

  function resize() {
    W = Math.max(960, window.innerWidth);
    H = Math.max(540, window.innerHeight);
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    floor = H - 78;
    if (ninja.onGround) ninja.y = floor;
    foes.forEach((f) => { if (!f.dead) f.y = floor; });
  }
  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < 42; i++) {
    embers.push({ x: Math.random() * 2600, y: Math.random() * 720, s: 0.6 + Math.random() * 1.8, v: 12 + Math.random() * 28, a: 0.15 + Math.random() * 0.45 });
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
      if (r === "throw") knives.push({ x: ninja.x + ninja.dir * 34, y: ninja.y - 92, vx: ninja.dir * 520, life: 0.75, hit: false });
    }
  });
  window.addEventListener("keyup", function (e) { keys[e.code] = false; });

  document.getElementById("toMenu").onclick = function () { EVGame.stop(); };
  document.getElementById("logoutPlay").onclick = function () {
    save(); EVAuth.logout(); location.href = "index.html";
  };

  function drawFallbackWorld() {
    ctx.fillStyle = "#09080f";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) {
      const par = 0.12 + i * 0.1;
      const x = -((cam * par) % 260);
      ctx.fillStyle = "rgba(48,32,82," + (0.1 + i * 0.045) + ")";
      for (let k = 0; k < Math.ceil(W / 160) + 3; k++) ctx.fillRect(x + k * 260, 30 + i * 28, 120 - i * 10, H * 0.42 - i * 16);
    }
    ctx.fillStyle = "#121018";
    ctx.fillRect(0, floor, W, H - floor);
    ctx.fillStyle = "rgba(190,150,255,0.22)";
    ctx.fillRect(0, floor, W, 3);
  }

  function world() {
    const arena = window.EVArt && EVArt.imgs && EVArt.imgs.arena;
    if (!arena || !arena.width) { drawFallbackWorld(); return; }
    ctx.fillStyle = "#05040a";
    ctx.fillRect(0, 0, W, H);
    const ih = H;
    const iw = arena.width * (ih / arena.height);
    const far = -((cam * 0.18) % iw);
    ctx.globalAlpha = 0.55;
    ctx.filter = "blur(2px) saturate(0.85)";
    for (let x = far - iw; x < W + iw; x += iw) ctx.drawImage(arena, x, -H * 0.06, iw, ih * 1.08);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    const mid = -((cam * 0.42) % iw);
    for (let x = mid - iw; x < W + iw; x += iw) ctx.drawImage(arena, x, 0, iw, ih);
    const flick = 0.035 + Math.sin(tWorld * 7.2) * 0.012;
    const g = ctx.createRadialGradient(W * 0.72, H * 0.42, 40, W * 0.55, H * 0.5, W * 0.7);
    g.addColorStop(0, "rgba(255,150,50," + (0.07 + flick) + ")");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.55, H * 0.2, W * 0.5, H * 0.5, H * 0.85);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.55)");
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
    EVCombat.burst(ninja.x, ninja.y - 70, "#ff6b4a", 16);
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
        ninja.vy = -620;
        ninja.onGround = false;
      }
      ninja.vy += 1750 * dt;
      ninja.x += ninja.vx * dt;
      ninja.y += ninja.vy * dt;
      if (ninja.x < 80) ninja.x = 80;
      if (ninja.x > 2400) ninja.x = 2400;
      if (ninja.y >= floor) { ninja.y = floor; ninja.vy = 0; ninja.onGround = true; }
      ninja.update(dt, { run: Math.abs(ninja.vx) > 20 && ninja.onGround });
      cam = EV.parts.lerp(cam, ninja.x - W * 0.35, 0.08);

      foes.forEach((f) => {
        const act = f.update(dt, ninja);
        if (act === "strike") hurtPlayer(f.atk, f.x + f.dir * 20, f.y - 80);
      });

      knives.forEach((k) => {
        k.x += k.vx * dt;
        k.life -= dt;
        if (k.hit) return;
        foes.forEach((f) => {
          if (f.dead || k.hit) return;
          if (Math.abs(k.x - f.x) < 36 && Math.abs(k.y - (f.y - 70)) < 90) {
            k.hit = true; k.life = 0;
            f.hit(18);
            EVCombat.burst(f.x, f.y - 80, "#ffe08a", 20);
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
        if (e.y < -10) { e.y = H + 10; e.x = cam * 0.42 + Math.random() * W; }
        ctx.fillStyle = "rgba(255,160,60," + e.a + ")";
        ctx.beginPath(); ctx.arc(e.x - cam * 0.55, e.y, e.s, 0, Math.PI * 2); ctx.fill();
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
