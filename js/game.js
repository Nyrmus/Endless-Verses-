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
  const keys = {};
  const ninja = new EVNinja({ x: 280, y: 500, scale: 1.55 });
  const knives = [];
  let gold = 0;
  let playing = false;
  let cam = 0;
  let W = 1280, H = 720, floor = 600;

  function resize() {
    W = Math.max(960, window.innerWidth);
    H = Math.max(540, window.innerHeight);
    canvas.width = W;
    canvas.height = H;
    floor = H - 86;
    if (ninja.onGround) ninja.y = floor;
  }
  window.addEventListener("resize", resize);
  resize();

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
      if (r === "throw") knives.push({ x: ninja.x + ninja.dir * 26, y: ninja.y - 42, vx: ninja.dir * 460, life: 0.75 });
    }
  });
  window.addEventListener("keyup", function (e) { keys[e.code] = false; });

  document.getElementById("toMenu").onclick = function () { EVGame.stop(); };
  document.getElementById("logoutPlay").onclick = function () {
    save(); EVAuth.logout(); location.href = "index.html";
  };

  function world() {
    ctx.fillStyle = "#09080f";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) {
      const par = 0.12 + i * 0.1;
      const x = -((cam * par) % 260);
      ctx.fillStyle = "rgba(48,32,82," + (0.1 + i * 0.045) + ")";
      for (let k = 0; k < Math.ceil(W / 160) + 3; k++) {
        ctx.fillRect(x + k * 260, 30 + i * 28, 120 - i * 10, H * 0.42 - i * 16);
      }
    }
    ctx.fillStyle = "#121018";
    ctx.fillRect(0, floor, W, H - floor);
    ctx.fillStyle = "rgba(190,150,255,0.22)";
    ctx.fillRect(0, floor, W, 3);
    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = i % 2 ? "#19151f" : "#14121a";
      ctx.fillRect(((i * 90 - cam * 0.6) % (W + 90)), floor + 10, 86, 14);
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
      if (ninja.y >= floor) {
        ninja.y = floor;
        ninja.vy = 0;
        ninja.onGround = true;
      }
      ninja.update(dt, { run: Math.abs(ninja.vx) > 20 && ninja.onGround });
      cam = EV.parts.lerp(cam, ninja.x - W * 0.35, 0.08);
      knives.forEach((k) => { k.x += k.vx * dt; k.life -= dt; });
      for (let i = knives.length - 1; i >= 0; i--) if (knives[i].life <= 0) knives.splice(i, 1);
      world();
      ctx.save();
      ctx.translate(-cam, 0);
      knives.forEach((k) => {
        ctx.fillStyle = "#ece8f4";
        ctx.fillRect(k.x, k.y, 14, 3);
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
