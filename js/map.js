window.EVMap = {
  brick: function (ctx, x, y, w, h, seed) {
    const bw = 28, bh = 14;
    for (let row = 0, ry = y; ry < y + h; row++, ry += bh) {
      const off = (row + seed) % 2 ? bw / 2 : 0;
      for (let rx = x - off; rx < x + w; rx += bw) {
        const n = ((rx * 13 + ry * 7 + seed * 3) % 17);
        const lit = n > 12;
        ctx.fillStyle = lit ? "#3a322c" : (n > 7 ? "#2a2420" : "#221c1a");
        ctx.fillRect(rx + 1, ry + 1, bw - 2, bh - 2);
        if (n === 2) {
          ctx.fillStyle = "rgba(40,70,40,0.28)";
          ctx.fillRect(rx + 4, ry + 6, 12, 5);
        }
      }
    }
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  },
  column: function (ctx, x, top, bot, w, t, i) {
    const mid = x + w / 2;
    const body = ctx.createLinearGradient(x, top, x + w, top);
    body.addColorStop(0, "#1a1614");
    body.addColorStop(0.18, "#6a5a4a");
    body.addColorStop(0.4, "#8a7a68");
    body.addColorStop(0.55, "#4a4038");
    body.addColorStop(1, "#12100e");
    ctx.fillStyle = body;
    ctx.fillRect(x + 6, top + 28, w - 12, bot - top - 48);
    ctx.fillStyle = "#5a5048";
    ctx.fillRect(x - 8, top, w + 16, 22);
    ctx.fillRect(x - 4, top + 22, w + 8, 10);
    ctx.fillStyle = "#3a342e";
    ctx.fillRect(x - 10, bot - 22, w + 20, 22);
    ctx.fillStyle = "#6a6054";
    ctx.fillRect(x - 6, bot - 26, w + 12, 6);
    for (let r = 0; r < 4; r++) {
      const yy = top + 70 + r * ((bot - top) / 5);
      ctx.fillStyle = "rgba(20,16,14,0.45)";
      ctx.fillRect(x + 8, yy, w - 16, 4);
    }
    const flick = 0.45 + Math.sin(t * 8 + i) * 0.25 + Math.sin(t * 13 + i * 2) * 0.1;
    const flameY = top + 54;
    ctx.fillStyle = "rgba(255,140,50," + (0.07 * flick) + ")";
    ctx.beginPath(); ctx.ellipse(mid, flameY + 20, 50, 70, 0, 0, Math.PI * 2); ctx.fill();
    if (window.EV && EV.kit) {
      EV.kit.draw(ctx, "flame_01", mid, flameY, 34 + flick * 10, 0.55 + flick * 0.3, t + i);
      EV.kit.draw(ctx, "light_01", mid, flameY + 8, 140, 0.16 * flick, 0);
    } else {
      ctx.fillStyle = "#ffb060"; ctx.beginPath(); ctx.ellipse(mid, flameY, 5, 10, 0, 0, Math.PI * 2); ctx.fill();
    }
  },
  draw: function (ctx, o) {
    const W = o.W, H = o.H, floor = o.floor, cam = o.cam, t = o.t;
    const sky = ctx.createLinearGradient(0, 0, 0, floor);
    sky.addColorStop(0, "#07060c");
    sky.addColorStop(0.25, "#120c1c");
    sky.addColorStop(0.65, "#2a1830");
    sky.addColorStop(1, "#3a2418");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 6; i++) {
      const wx = ((i * 340 - cam * 0.08) % (W + 340));
      const win = ctx.createLinearGradient(wx, 70, wx + 70, 220);
      win.addColorStop(0, "rgba(120,80,255,0.18)");
      win.addColorStop(0.5, "rgba(180,60,220,0.1)");
      win.addColorStop(1, "rgba(40,20,80,0.04)");
      ctx.fillStyle = win;
      ctx.beginPath();
      ctx.moveTo(wx + 8, 210);
      ctx.lineTo(wx + 8, 90);
      ctx.quadraticCurveTo(wx + 40, 50, wx + 72, 90);
      ctx.lineTo(wx + 72, 210);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(200,170,255," + (0.04 + Math.sin(t * 0.7 + i) * 0.02) + ")";
      ctx.beginPath();
      ctx.moveTo(wx + 28, 70);
      ctx.lineTo(wx + 48, floor);
      ctx.lineTo(wx + 58, floor);
      ctx.lineTo(wx + 38, 70);
      ctx.closePath();
      ctx.fill();
    }

    for (let i = -1; i < 8; i++) {
      const px = ((i * 240 - cam * 0.18) % (W + 240));
      this.brick(ctx, px, 80, 88, floor - 80, i + 3);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(px + 70, 80, 18, floor - 80);
    }

    ctx.fillStyle = "#141018";
    ctx.fillRect(0, 0, W, 62);
    for (let i = 0; i < 14; i++) {
      const bx = ((i * 140 - cam * 0.22) % (W + 140));
      ctx.fillStyle = i % 2 ? "#1c1816" : "#161210";
      ctx.beginPath();
      ctx.moveTo(bx, 62);
      ctx.quadraticCurveTo(bx + 70, 110, bx + 140, 62);
      ctx.lineTo(bx + 140, 48);
      ctx.lineTo(bx, 48);
      ctx.closePath();
      ctx.fill();
    }

    for (let i = -1; i < 7; i++) {
      const px = ((i * 320 - cam * 0.52) % (W + 320));
      this.column(ctx, px, 46, floor, 64, t, i);
    }

    ctx.fillStyle = "#0e0c0a";
    ctx.fillRect(0, floor, W, H - floor);
    this.brick(ctx, -((cam * 0.7) % 56), floor + 18, W + 80, H - floor, 9);

    ctx.save();
    ctx.beginPath(); ctx.rect(0, floor, W, Math.min(90, H - floor)); ctx.clip();
    ctx.globalAlpha = 0.18;
    ctx.scale(1, -0.35);
    ctx.translate(0, -floor * 2 - 8);
    for (let i = -1; i < 7; i++) {
      const px = ((i * 320 - cam * 0.52) % (W + 320));
      this.column(ctx, px, 46, floor, 64, t, i);
    }
    ctx.restore();

    const wet = ctx.createLinearGradient(0, floor, 0, H);
    wet.addColorStop(0, "rgba(210,190,255,0.16)");
    wet.addColorStop(0.12, "rgba(255,170,80,0.07)");
    wet.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = wet;
    ctx.fillRect(0, floor, W, H - floor);
    ctx.fillStyle = "rgba(230,210,180,0.35)";
    ctx.fillRect(0, floor, W, 2);
    ctx.fillStyle = "rgba(160,120,255,0.2)";
    ctx.fillRect(0, floor + 2, W, 1);

    for (let i = 0; i < 9; i++) {
      const rx = ((i * 210 - cam * 0.6) % (W + 210));
      ctx.fillStyle = "rgba(20,16,14,0.55)";
      ctx.beginPath();
      ctx.moveTo(rx, floor);
      ctx.lineTo(rx + 18, floor);
      ctx.lineTo(rx + 10, floor - 8);
      ctx.closePath();
      ctx.fill();
    }

    const vig = ctx.createRadialGradient(W * 0.5, H * 0.48, H * 0.1, W * 0.5, H * 0.5, H * 0.82);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(0.7, "rgba(0,0,0,0.2)");
    vig.addColorStop(1, "rgba(0,0,0,0.62)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }
};
