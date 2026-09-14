(function () {
  const lobby = document.getElementById("lobby");
  const playEl = document.getElementById("play");
  const preview = document.getElementById("preview");
  const pctx = preview.getContext("2d");
  pctx.imageSmoothingEnabled = true;
  pctx.imageSmoothingQuality = "high";
  const ninja = new EVNinja({ x: 210, y: 430, scale: 1.85 });
  const tokenEl = document.getElementById("tokenCount");
  const eqEl = document.getElementById("eqWeapon");

  function tokens() { return EVData.tokens(); }
  function paintTokens() { tokenEl.textContent = String(tokens()); }

  function weaponId() {
    return (window.EVLoadout && EVLoadout.get().weapon) || "blade";
  }
  function weaponName() {
    const id = weaponId();
    if (id === "none") return "Unbewaffnet";
    if (id === "obsidian") return "Obsidian-Messer";
    if (id === "veil") return "Schleier-Messer";
    return "Wurfmesser";
  }

  function showPanel(id) {
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("on"));
    const el = document.getElementById(id);
    if (el) el.classList.add("on");
    if (window.EV && EV.audio) EV.audio.click();
  }

  document.querySelectorAll("[data-panel]").forEach((btn) => {
    btn.onclick = function () { showPanel(btn.getAttribute("data-panel")); };
  });
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.onclick = function () { document.querySelectorAll(".panel").forEach((p) => p.classList.remove("on")); };
  });

  function renderIndex() {
    const box = document.getElementById("indexList");
    box.innerHTML = EVData.monsters.map((m) =>
      "<article class=\"card\">" +
      "<h3>" + m.name + " <em>" + m.role + "</em></h3>" +
      "<p><b>Muster</b> " + m.pattern + "</p>" +
      "<p><b>Angriff</b> " + m.atk + "</p>" +
      "<p><b>Schwäche</b> " + m.weak + "</p>" +
      "<p><b>Skills</b> " + m.skills.join(" · ") + "</p></article>"
    ).join("");
  }

  function renderShop() {
    const box = document.getElementById("shopList");
    box.innerHTML = EVData.shop.map((s) =>
      "<article class=\"card\"><h3>" + s.name + "</h3><p>" + (s.note || "Ausrüstung") +
      "</p><button type=\"button\" data-buy=\"" + s.id + "\">" + s.cost + " Tokens</button></article>"
    ).join("");
  }

  function renderMods() {
    const box = document.getElementById("modList");
    box.innerHTML = EVData.mods.map((m) => {
      const stars = "★".repeat(m.stars) + "☆".repeat(5 - m.stars);
      return "<article class=\"mod-card locked\">" +
        "<small>" + m.type.toUpperCase() + "</small><h3>" + m.name + "</h3>" +
        "<p>" + m.desc + "</p><div class=\"stars\">" + stars + "</div>" +
        "<button type=\"button\" disabled>Aufwerten · In Development</button></article>";
    }).join("");
    document.getElementById("modStrip").innerHTML = EVData.mods.map((m) =>
      "<div class=\"mod-mini locked\"><b>" + m.name + "</b><span>" + m.type + " · " + m.stars + "/5</span></div>"
    ).join("");
  }

  document.getElementById("shopList").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-buy]");
    if (!btn) return;
    const item = EVData.shop.find((s) => s.id === btn.getAttribute("data-buy"));
    if (!item) return;
    if (tokens() < item.cost) return;
    EVData.setTokens(tokens() - item.cost);
    if (item.slot && window.EVLoadout) EVLoadout.set(item.slot, item.item);
    paintTokens();
    eqEl.textContent = weaponName();
  });

  const slotsEl = document.getElementById("slots");
  const itemsEl = document.getElementById("items");
  let active = "weapon";
  function drawLoadout() {
    const eq = EVLoadout.get();
    slotsEl.innerHTML = EVLoadout.SLOTS.map((s) => {
      const it = EVLoadout.find(s, eq[s]);
      return "<button type=\"button\" class=\"slot" + (s === active ? " on" : "") + "\" data-slot=\"" + s + "\">" +
        "<small>" + EVLoadout.LABELS[s] + "</small><b>" + it.name + "</b></button>";
    }).join("");
    itemsEl.innerHTML = EVLoadout.ITEMS[active].map((it) =>
      "<button type=\"button\" class=\"item" + (eq[active] === it.id ? " on" : "") + "\" data-id=\"" + it.id + "\">" + it.name + "</button>"
    ).join("");
    eqEl.textContent = weaponName();
  }
  slotsEl.addEventListener("click", function (e) {
    const b = e.target.closest("[data-slot]");
    if (!b) return;
    active = b.getAttribute("data-slot");
    drawLoadout();
  });
  itemsEl.addEventListener("click", function (e) {
    const b = e.target.closest("[data-id]");
    if (!b) return;
    EVLoadout.set(active, b.getAttribute("data-id"));
    drawLoadout();
  });

  function startGame() {
    if (window.EVGame) EVGame.start();
    lobby.classList.add("off");
    playEl.classList.add("on");
    EV.audio.start();
  }
  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("startSide").onclick = startGame;

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    ninja.update(dt, { run: false });
    pctx.clearRect(0, 0, preview.width, preview.height);
    const bg = window.EVArt && EVArt.imgs && EVArt.imgs.arena;
    if (bg && bg.width) {
      pctx.globalAlpha = 0.55;
      pctx.drawImage(bg, -80, 40, 580, 390);
      pctx.globalAlpha = 1;
    }
    const g = pctx.createRadialGradient(210, 300, 40, 210, 280, 260);
    g.addColorStop(0, "rgba(120,70,255,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    pctx.fillStyle = g;
    pctx.fillRect(0, 0, preview.width, preview.height);
    pctx.fillStyle = "rgba(0,0,0,0.45)";
    pctx.beginPath(); pctx.ellipse(210, 438, 78, 14, 0, 0, Math.PI * 2); pctx.fill();
    ninja.draw(pctx, weaponId());
    requestAnimationFrame(tick);
  }

  paintTokens();
  eqEl.textContent = weaponName();
  renderIndex();
  renderShop();
  renderMods();
  drawLoadout();
  requestAnimationFrame(tick);
})();
