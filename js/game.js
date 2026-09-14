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
  const ninja = new EVNinja({ x: 280, y: 420, scale: 1.45 });
  const knives = [];
  let gold = 0, hp = 100, playing = false, cam = 0, W = 1280, H = 720, floor = 480, tWorld = 0, invuln = 0;
  const foes = [
    new EVEnemy({ id: "ashwraith", name: "Ashwraith", x: 820, y: 420, hp: 80, atk: 14, range: 70, scale: 1.15 }),
    new EVEnemy({ id: "ironbell", name: "Ironbell", x: 1280, y: 420, hp: 220, atk: 22, range: 88, scale: 1.3 }),
    new EVEnemy({ id: "silkfang", name: "Silkfang", x: 1680, y: 420, hp: 70, atk: 16, range: 70, scale: 1.1 })
  ];

  function resize() {
    W = Math.max(960, window.innerWidth); H = Math.max(540, window.innerHeight);
    canvas.width = W; canvas.height = H;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    floor = Math.floor(H * 0.7);
    if (ninja.onGround) ninja.y = floor;
    foes.forEach((f) => { f.y = floor; });
  }
  window.addEventListener("resize", resize); resize();

  function load() { try { const d = JSON.parse(localStorage.getItem(SAVE) || "{}"); if (typeof d.gold === "number") gold = d.gold; } catch (e) {} }
  function save() { localStorage.setItem(SAVE, JSON.stringify({ gold: gold, x: ninja.x })); }

  window.EVGame = {
    start: function () { resize(); hp = 100; playing = true; last = performance.now(); EV.audio.start(); },
    stop: function () { save(); playing = false; playEl.classList.remove("on"); lobbyEl.classList.remove("off"); }
  };

  window.addEventListener("keydown", function (e) {
    if (!playing) return;
    keys[e.code] = true;
    if (["Space", "ArrowUp"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyQ") ninja.dash();
    if (e.code === "KeyR") ninja.parry();
    if (e.code === "KeyF" || e.code === "KeyJ") {
      const r = ninja.throwKnife();
      if (r === "throw") knives.push({ x: ninja.x + ninja.dir * 42, y: ninja.y - 118, vx: ninja.dir * 540, life: 0.75, hit: false });
    }
  });
  window.addEventListener("keyup", function (e) { keys[e.code] = false; });
  document.getElementById("toMenu").onclick = function () { EVGame.stop(); };
  document.getElementById("logoutPlay").onclick = function () { save(); EVAuth.logout(); location.href = "index.html"; };

  function world() {
    const g = ctx.createLinearGradient(0, 0, 0, floor);
    g.addColorStop(0, "#0a0712"); g.addColorStop(0.4, "#1a1030"); g.addColorStop(0.72, "#3a1848"); g.addColorStop(1, "#5a2a18");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const chroma = ctx.createLinearGradient(0, 80, W, floor);
    chroma.addColorStop(0, "rgba(80,40,255,0.08)"); chroma.addColorStop(0.5, "rgba(180,80,255,0.05)"); chroma.addColorStop(1, "rgba(255,140,60,0.1)");
    ctx.fillStyle = chroma; ctx.fillRect(0, 0, W, floor);
    for (let i = -1; i < 9; i++) {
      const px = ((i * 260 - cam * 0.2) % (W + 260));
      ctx.fillStyle = "rgba(40,24,70,0.35)"; ctx.fillRect(px, 50, 90, floor - 50);
    }
    for (let i = -1; i < 8; i++) {
      const px = ((i * 300 - cam * 0.55) % (W + 300));
      const flick = 0.35 + Math.sin(tWorld * 7 + i) * 0.2;
      ctx.fillStyle = "#16101c"; ctx.fillRect(px, 58, 56, floor - 58);
      const rim = ctx.createLinearGradient(px, 58, px + 56, 58);
      rim.addColorStop(0, "rgba(180,120,255,0.35)"); rim.addColorStop(0.4, "rgba(255,255,255,0)"); rim.addColorStop(1, "rgba(255,160,60,0.25)");
      ctx.fillStyle = rim; ctx.fillRect(px, 58, 56, floor - 58);
      ctx.fillStyle = "#2a2234"; ctx.fillRect(px - 10, 50, 76, 16); ctx.fillRect(px - 12, floor - 16, 80, 16);
      EV.kit.draw(ctx, "flame_01", px + 28, 92, 36, 0.35 + flick * 0.4, tWorld);
      EV.kit.draw(ctx, "light_01", px + 28, 110, 120, 0.12 + flick * 0.08, 0);
    }
    ctx.fillStyle = "#120e10"; ctx.fillRect(0, floor, W, H - floor);
    const sheen = ctx.createLinearGradient(0, floor, 0, H);
    sheen.addColorStop(0, "rgba(200,160,255,0.18)"); sheen.addColorStop(0.15, "rgba(255,170,70,0.08)"); sheen.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = sheen; ctx.fillRect(0, floor, W, H - floor);
    ctx.fillStyle = "rgba(220,180,255,0.35)"; ctx.fillRect(0, floor, W, 2);
    ctx.fillStyle = "rgba(255,170,70,0.25)"; ctx.fillRect(0, floor + 2, W, 1);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.52, H * 0.12, W * 0.5, H * 0.5, H * 0.78);
    vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  function hurtPlayer(dmg, x, y) {
    if (invuln > 0) return;
    if (ninja.state === "parry") { EVCombat.burst(x, y, "#c9b6ff", 18); if (EV.audio) EV.audio.parry(); return; }
    hp = Math.max(0, hp - dmg); invuln = 0.55; EVCombat.burst(ninja.x, ninja.y - 90, "#ff6b4a", 16);
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000); last = now;
    if (playing) {
      tWorld += dt; invuln = Math.max(0, invuln - dt);
      const left = keys.KeyA || keys.ArrowLeft, right = keys.KeyD || keys.ArrowRight;
      const jump = keys.Space || keys.KeyW || keys.ArrowUp;
      if (ninja.state !== "parry" && ninja.state !== "dash") {
        ninja.vx = (right ? 220 : 0) - (left ? 220 : 0);
        if (ninja.vx) ninja.dir = ninja.vx > 0 ? 1 : -1;
      }
      if (jump && ninja.onGround && ninja.state !== "parry") { ninja.vy = -640; ninja.onGround = false; }
      ninja.vy += 1750 * dt; ninja.x += ninja.vx * dt; ninja.y += ninja.vy * dt;
      if (ninja.x < 80) ninja.x = 80; if (ninja.x > 2400) ninja.x = 2400;
      if (ninja.y >= floor) { ninja.y = floor; ninja.vy = 0; ninja.onGround = true; }
      ninja.update(dt, { run: Math.abs(ninja.vx) > 20 && ninja.onGround });
      cam = EV.parts.lerp(cam, ninja.x - W * 0.38, 0.08);
      foes.forEach((f) => { const act = f.update(dt, ninja); if (act === "strike") hurtPlayer(f.atk, f.x + f.dir * 18, f.y - 90); });
      knives.forEach((k) => {
        k.x += k.vx * dt; k.life -= dt; if (k.hit) return;
        foes.forEach((f) => {
          if (f.dead || k.hit) return;
          if (Math.abs(k.x - f.x) < 42 && Math.abs(k.y - (f.y - 80)) < 110) {
            k.hit = true; k.life = 0; f.hit(18); EVCombat.burst(f.x, f.y - 90, "#ffe08a", 22); if (f.dead) gold += 25;
          }
        });
      });
      for (let i = knives.length - 1; i >= 0; i--) if (knives[i].life <= 0) knives.splice(i, 1);
      EVCombat.update(dt);
      world();
      ctx.save(); ctx.translate(-cam, 0);
      foes.forEach((f) => f.draw(ctx));
      knives.forEach((k) => {
        ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(k.vx > 0 ? 0.2 : Math.PI - 0.2);
        ctx.fillStyle = "#f4f0ea"; ctx.fillRect(0, -2, 18, 3); ctx.fillStyle = "#c9a24a"; ctx.fillRect(0, -3, 4, 5);
        ctx.restore();
      });
      ninja.draw(ctx); EVCombat.draw(ctx); ctx.restore();
      lootHud.textContent = "GOLD " + gold + " · Messer " + ninja.knives;
      stamHud.style.width = ninja.stamina + "%"; if (hpHud) hpHud.style.width = hp + "%";
      verseLabel.textContent = ninja.state === "parry" ? "PARRY" : "TEMPEL · SHADOW HALL";
    }
    requestAnimationFrame(tick);
  }
  load(); requestAnimationFrame(tick); window.addEventListener("beforeunload", save);
})();
