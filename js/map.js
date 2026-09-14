window.EVMap = {
  tileFloor: function (ctx, W, H, floor, cam) {
    ctx.fillStyle = "#0a090c";
    ctx.fillRect(0, floor, W, H - floor);
    const depth = H - floor;
    for (let row = 0; row < 10; row++) {
      const y0 = floor + (row * row * 0.9);
      const y1 = floor + ((row + 1) * (row + 1) * 0.9);
      if (y0 > H) break;
      const scale = 1 + row * 0.35;
      const tw = 54 * scale;
      const off = -((cam * (0.35 + row * 0.04)) % tw);
      for (let x = off - tw; x < W + tw; x += tw) {
        const n = (Math.floor(x / tw) + row) & 1;
        ctx.fillStyle = n ? "#1c181c" : "#151218";
        ctx.fillRect(x + 1, y0 + 1, tw - 2, Math.max(3, y1 - y0 - 1));
        ctx.fillStyle = "rgba(180,140,255,0.06)";
        ctx.fillRect(x + 2, y0 + 1, tw * 0.45, 2);
      }
    }
    const wet = ctx.createLinearGradient(0, floor, 0, H);
    wet.addColorStop(0, "rgba(170,130,255,0.16)");
    wet.addColorStop(0.2, "rgba(255,160,70,0.06)");
    wet.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = wet;
    ctx.fillRect(0, floor, W, H - floor);
    ctx.fillStyle = "rgba(220,190,255,0.28)";
    ctx.fillRect(0, floor, W, 2);
  },
  window: function (ctx, x, top, bot, t, i) {
    const w = 78, h = bot - top;
    ctx.fillStyle = "#2a2430";
    ctx.fillRect(x - 6, top - 8, w + 12, h + 16);
    const g = ctx.createLinearGradient(x, top, x + w, bot);
    g.addColorStop(0, "rgba(210,160,255,0.55)");
    g.addColorStop(0.45, "rgba(90,40,160,0.35)");
    g.addColorStop(1, "rgba(20,8,40,0.15)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x + 6, bot);
    ctx.lineTo(x + 6, top + 28);
    ctx.quadraticCurveTo(x + w / 2, top - 8, x + w - 6, top + 28);
    ctx.lineTo(x + w - 6, bot);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(10,8,14,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, top + 6);
    ctx.lineTo(x + w / 2, bot);
    ctx.moveTo(x + 10, top + h * 0.45);
    ctx.lineTo(x + w - 10, top + h * 0.45);
    ctx.stroke();
    const pulse = 0.05 + Math.sin(t * 0.8 + i) * 0.02;
    ctx.fillStyle = "rgba(190,150,255," + pulse + ")";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.42, top + 10);
    ctx.lineTo(x + w * 0.48, floorSafe(bot + 120));
    ctx.lineTo(x + w * 0.58, floorSafe(bot + 120));
    ctx.lineTo(x + w * 0.52, top + 10);
    ctx.closePath();
    ctx.fill();
    function floorSafe(v) { return v; }
  },
  lantern: function (ctx, x, y, t, i) {
    ctx.strokeStyle = "rgba(40,30,20,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y - 70); ctx.lineTo(x, y); ctx.stroke();
    const flick = 0.55 + Math.sin(t * 7 + i) * 0.2;
    if (window.EV && EV.kit) {
      EV.kit.draw(ctx, "light_01", x, y + 8, 90, 0.18 * flick, 0);
      EV.kit.draw(ctx, "flame_02", x, y + 4, 28, 0.7 * flick, t + i);
    }
    ctx.fillStyle = "#3a2a18";
    ctx.fillRect(x - 7, y - 4, 14, 18);
    ctx.fillStyle = "rgba(255,170,70," + (0.35 * flick) + ")";
    ctx.fillRect(x - 5, y - 1, 10, 12);
  },
  column: function (ctx, x, top, bot, w, t, i) {
    const mid = x + w / 2;
    const body = ctx.createLinearGradient(x, 0, x + w, 0);
    body.addColorStop(0, "#0c0a0c");
    body.addColorStop(0.22, "#5a4a40");
    body.addColorStop(0.4, "#8a7460");
    body.addColorStop(0.58, "#3a322c");
    body.addColorStop(1, "#09080a");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(x + 8, top + 36);
    ctx.lineTo(x + w - 8, top + 36);
    ctx.lineTo(x + w - 4, bot - 28);
    ctx.lineTo(x + 4, bot - 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6a5c4c";
    ctx.fillRect(x - 10, top, w + 20, 18);
    ctx.fillRect(x - 4, top + 18, w + 8, 16);
    ctx.fillStyle = "#2a2420";
    ctx.fillRect(x - 14, bot - 24, w + 28, 24);
    ctx.fillStyle = "#7a6a58";
    ctx.fillRect(x - 6, bot - 28, w + 12, 6);
    ctx.fillStyle = "rgba(40,80,40,0.25)";
    ctx.fillRect(x + 6, bot - 70, 10, 40);
    this.lantern(ctx, mid + 22, top + 58, t, i);
  },
  draw: function (ctx, o) {
    const W = o.W, H = o.H, floor = o.floor, cam = o.cam, t = o.t;
    const img = window.EVArt && EVArt.imgs && EVArt.imgs.arena;
    if (img && img.width) {
      const ih = floor + 24;
      const iw = img.width * (ih / img.height);
      const far = -((cam * 0.12) % iw);
      ctx.globalAlpha = 0.55;
      for (let x = far - iw; x < W + iw; x += iw) ctx.drawImage(img, x, -20, iw, ih + 20);
      ctx.globalAlpha = 1;
      const mid = -((cam * 0.38) % iw);
      for (let x = mid - iw; x < W + iw; x += iw) ctx.drawImage(img, x, 0, iw, ih);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, floor);
      sky.addColorStop(0, "#08060e");
      sky.addColorStop(0.35, "#1a1028");
      sky.addColorStop(0.7, "#2a1838");
      sky.addColorStop(1, "#241818");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      for (let i = -1; i < 7; i++) {
        const wx = ((i * 280 - cam * 0.12) % (W + 280));
        this.window(ctx, wx + 40, 54, Math.min(floor - 40, 280), t, i);
      }
    }
    ctx.fillStyle = "rgba(12,8,18,0.28)";
    ctx.fillRect(0, 0, W, 52);
    for (let i = -1; i < 8; i++) {
      const px = ((i * 300 - cam * 0.5) % (W + 300));
      this.column(ctx, px, 36, floor, 58, t, i);
    }
    this.tileFloor(ctx, W, H, floor, cam);
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.beginPath(); ctx.rect(0, floor, W, 70); ctx.clip();
    ctx.scale(1, -0.32);
    ctx.translate(0, -floor * 2);
    for (let i = -1; i < 8; i++) {
      const px = ((i * 300 - cam * 0.5) % (W + 300));
      this.column(ctx, px, 36, floor, 58, t, i);
    }
    ctx.restore();
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.08, W * 0.5, H * 0.5, H * 0.85);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.58)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }
};
