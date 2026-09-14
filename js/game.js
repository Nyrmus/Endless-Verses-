(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const verseLabel = document.getElementById("verseName");
  const lootHud = document.getElementById("lootHud");
  const stamHud = document.getElementById("stamHud");
  const lobbyEl = document.getElementById("lobby");
  const playEl = document.getElementById("play");
  const user = window.EVAuth && EVAuth.current();
  const SAVE = "endless-verses-run-" + (user ? user.name : "guest");
  const W = canvas.width, H = canvas.height;
  const keys = {};
  const ninja = new EVNinja({ x: 160, y: 318, scale: 1.15 });
  const knives = [];
  let gold = 0;
  let playing = false;
  let cam = 0;
  const floor = 340;

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
      if (r === "throw") {
        knives.push({ x: ninja.x + ninja.dir * 18, y: ninja.y - 28, vx: ninja.dir * 420, life: 0.7 });
      }
    }
  });
  window.addEventListener("keyup", function (e) { keys[e.code] = false; });

  document.getElementById("toMenu").onclick = function () { EVGame.stop(); };
  document.getElementById("logoutPlay").onclick = function () {
    save(); EVAuth.logout(); location.href = "index.html";
  };

  function world() {
    ctx.fillStyle = "#0b0912";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      const par = 0.15 + i * 0.12;
      const x = -((cam * par) % 220);
      ctx.fillStyle = "rgba(40,28,70," + (0.12 + i * 0.05) + ")";
      for (let k = 0; k < 8; k++) ctx.fillRect(x + k * 220, 40 + i * 18, 90 - i * 8, 160 - i * 10);
    }
    ctx.fillStyle = "#16121c";
    ctx.fillRect(0, floor, W, H - floor);
    ctx.fillStyle = "rgba(180,140,255,0.25)";
    ctx.fillRect(0, floor, W, 2);
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 2 ? "#1a1620" : "#141018";
      ctx.fillRect(((i * 70 - cam) % (W + 70)), floor + 8, 68, 10);
    }
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (playing) {
      const left = keys.KeyA || keys.ArrowLeft;
      const right = keys.KeyD || keys.ArrowRight;
      const jump = keys.Space || keys.KeyW || keys.ArrowUp;
      if (ninja.state !== "parry" && ninja.state !== "dash") {
        ninja.vx = (right ? 190 : 0) - (left ? 190 : 0);
        if (ninja.vx) ninja.dir = ninja.vx > 0 ? 1 : -1;
      }
      if (jump && ninja.onGround && ninja.state !== "parry") {
        ninja.vy = -520;
        ninja.onGround = false;
      }
      ninja.vy += 1600 * dt;
      ninja.x += ninja.vx * dt;
      ninja.y += ninja.vy * dt;
      if (ninja.x < 40) ninja.x = 40;
      if (ninja.x > 900) ninja.x = 900;
      if (ninja.y >= floor) {
        ninja.y = floor;
        ninja.vy = 0;
        ninja.onGround = true;
      }
      ninja.update(dt, { run: Math.abs(ninja.vx) > 20 && ninja.onGround });
      cam = EV.parts.lerp(cam, ninja.x - 200, 0.08);
      knives.forEach((k) => { k.x += k.vx * dt; k.life -= dt; });
      for (let i = knives.length - 1; i >= 0; i--) if (knives[i].life <= 0) knives.splice(i, 1);
      world();
      ctx.save();
      ctx.translate(-cam * 0.2, 0);
      knives.forEach((k) => {
        ctx.fillStyle = "#e8e4f0";
        ctx.fillRect(k.x, k.y, 10, 2);
      });
      ninja.draw(ctx, (EVLoadout.get().weapon || "blade"));
      ctx.restore();
      lootHud.textContent = "GOLD " + gold + " · Messer " + ninja.knives;
      stamHud.style.width = ninja.stamina + "%";
      verseLabel.textContent = ninja.state === "parry" ? "PARRY" : "NINJA";
    }
    requestAnimationFrame(tick);
  }
  load();
  requestAnimationFrame(tick);
  window.addEventListener("beforeunload", save);
})();
