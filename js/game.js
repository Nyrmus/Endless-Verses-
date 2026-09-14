(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const verseLabel = document.getElementById("verseName");
  const SAVE_KEY = "endless-verses-v01";

  const keys = {};
  const player = {
    x: 200,
    y: 360,
    vx: 0,
    vy: 0,
    w: 28,
    h: 48,
    onGround: false
  };

  let verseId = "hub";
  const gravity = 1800;
  const speed = 240;
  const jump = 620;
  const floor = 430;

  function verse() {
    return window.VERSES[verseId] || window.VERSES.hub;
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.x === "number") player.x = data.x;
      if (typeof data.y === "number") player.y = data.y;
      if (data.verse && window.VERSES[data.verse]) verseId = data.verse;
    } catch (e) {}
  }

  function save() {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ x: player.x, y: player.y, verse: verseId })
    );
  }

  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === "Digit1") verseId = "hub";
    if (e.code === "Digit2") verseId = "soul";
  });
  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  let last = performance.now();
  let saveTimer = 0;

  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    const left = keys.ArrowLeft || keys.KeyA;
    const right = keys.ArrowRight || keys.KeyD;
    const wantJump = keys.Space || keys.KeyW || keys.ArrowUp;

    player.vx = (right ? speed : 0) - (left ? speed : 0);
    player.vy += gravity * dt;
    if (wantJump && player.onGround) {
      player.vy = -jump;
      player.onGround = false;
    }

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    if (player.x < 20) player.x = 20;
    if (player.x > 940) player.x = 940;

    if (player.y + player.h >= floor) {
      player.y = floor - player.h;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }

    draw();
    verseLabel.textContent = verse().name;

    saveTimer += dt;
    if (saveTimer > 1) {
      saveTimer = 0;
      save();
    }
    requestAnimationFrame(tick);
  }

  function rgb(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  function draw() {
    const v = verse();
    ctx.fillStyle = rgb(v.sky, 1);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 6; i++) {
      const z = 0.25 + i * 0.12;
      ctx.fillStyle = rgb(v.fog, 0.18 + i * 0.05);
      const y = 180 + i * 28;
      ctx.fillRect(0, y, canvas.width, 40);
      ctx.fillStyle = rgb(v.accent, 0.08);
      ctx.fillRect(80 + i * 140, y - 70 * z, 70 * z, 70 * z);
    }

    ctx.fillStyle = rgb(v.ground, 1);
    ctx.fillRect(0, floor, canvas.width, canvas.height - floor);
    ctx.fillStyle = rgb(v.accent, 0.35);
    ctx.fillRect(0, floor, canvas.width, 3);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(player.x + player.w / 2, floor + 6, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e8e4d8";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = rgb(v.accent, 1);
    ctx.fillRect(player.x + 6, player.y + 10, 16, 8);
  }

  load();
  requestAnimationFrame(tick);
  window.addEventListener("beforeunload", save);
})();
