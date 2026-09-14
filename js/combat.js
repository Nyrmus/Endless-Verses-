window.EVCombat = {
  sparks: [],
  burst: function (x, y, col, n) {
    for (let i = 0; i < (n || 14); i++) {
      const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 240;
      this.sparks.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50, life: 0.22 + Math.random() * 0.25, max: 0.45, col: col || "#ffe08a", s: 2 + Math.random() * 3, kit: Math.random() > 0.5 ? "spark_01" : "slash_01" });
    }
  },
  update: function (dt) {
    this.sparks.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 380 * dt; s.life -= dt; });
    this.sparks = this.sparks.filter((s) => s.life > 0);
  },
  draw: function (ctx) {
    this.sparks.forEach((s) => {
      const a = Math.max(0, s.life / s.max);
      if (!EV.kit.draw(ctx, s.kit, s.x, s.y, 18 + s.s * 6, a, s.x)) {
        ctx.globalAlpha = a; ctx.fillStyle = s.col; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
    });
  }
};
function limb(ctx, x, y, a, len, w, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); ctx.lineTo(w * 0.35, len); ctx.lineTo(-w * 0.35, len); ctx.closePath(); ctx.fill();
  ctx.restore();
}
window.EVEnemy = function (spec) {
  this.id = spec.id; this.name = spec.name; this.x = spec.x; this.y = spec.y;
  this.dir = -1; this.hp = spec.hp; this.max = spec.hp; this.atk = spec.atk || 12;
  this.range = spec.range || 70; this.wind = 0; this.cd = 0.8 + Math.random();
  this.hurt = 0; this.dead = false; this.t = 0; this.scale = spec.scale || 1;
  this.phase = "idle"; this.home = spec.x;
};
EVEnemy.prototype.update = function (dt, ninja) {
  if (this.dead) return null;
  this.t += dt; this.hurt = Math.max(0, this.hurt - dt); this.cd -= dt;
  const dx = ninja.x - this.x; const dist = Math.abs(dx);
  this.dir = dx < 0 ? -1 : 1;
  if (this.id === "ashwraith") {
    if (this.phase === "blink") {
      this.x += this.dir * 520 * dt; this.wind += dt;
      if (this.wind > 0.16) { this.phase = "cut"; this.wind = 0; return "strike"; }
      return null;
    }
    if (this.phase === "cut" && this.wind < 0.25) { this.wind += dt; return null; }
    if (dist > 210) this.x += this.dir * 55 * dt;
    else if (this.cd <= 0) { this.phase = "blink"; this.wind = 0; this.cd = 1.6; }
    else this.x += Math.sin(this.t * 3) * 18 * dt;
    return null;
  }
  if (this.id === "ironbell") {
    if (this.phase === "slam") {
      this.wind += dt;
      if (this.wind > 0.7) { this.phase = "idle"; this.wind = 0; this.cd = 2.1; return "strike"; }
      return null;
    }
    if (dist > this.range) this.x += this.dir * 38 * dt;
    else if (this.cd <= 0) { this.phase = "slam"; this.wind = 0; }
    return null;
  }
  if (dist > 160) this.x += this.dir * 90 * dt;
  else {
    this.x += -this.dir * Math.sin(this.t * 2.4) * 40 * dt;
    if (this.cd <= 0 && dist < 90) { this.cd = 1.2; this.phase = "stab"; this.wind = 0; return "strike"; }
  }
  if (this.phase === "stab") { this.wind += dt; if (this.wind > 0.25) this.phase = "idle"; }
  return null;
};
EVEnemy.prototype.hit = function (dmg) {
  if (this.dead) return;
  this.hp -= dmg; this.hurt = 0.16;
  if (this.hp <= 0) { this.hp = 0; this.dead = true; }
};
EVEnemy.prototype.drawAsh = function (ctx) {
  const bob = Math.sin(this.t * 3.2) * 4;
  const walk = Math.sin(this.t * 4);
  ctx.translate(0, bob);
  ctx.globalAlpha = this.phase === "blink" ? 0.45 : 0.95;
  ctx.fillStyle = "rgba(80,40,120,0.25)";
  ctx.beginPath(); ctx.ellipse(0, -40, 22, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = this.hurt ? "#ddd" : "#1a1420";
  ctx.beginPath(); ctx.moveTo(-10, -78); ctx.quadraticCurveTo(18, -40, 6, 2); ctx.lineTo(-16, 4); ctx.quadraticCurveTo(-18, -40, -10, -78); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#cfc4b0"; ctx.beginPath(); ctx.ellipse(0, -88, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2a2018"; ctx.fillRect(-7, -90, 14, 5);
  ctx.fillStyle = "#c9a24a"; ctx.fillRect(-3, -87, 2, 2); ctx.fillRect(2, -87, 2, 2);
  limb(ctx, -8, -70, -0.6 + walk * 0.2, 28, 6, "#121018");
  limb(ctx, 8, -70, 0.5 + (this.phase === "cut" ? -1.6 : 0), 30, 6, "#121018");
  if (this.phase === "blink" && EV.kit) EV.kit.draw(ctx, "smoke_06", 0, -36, 90, 0.45, 0);
  ctx.globalAlpha = 1;
};
EVEnemy.prototype.drawBell = function (ctx) {
  const stomp = this.phase === "slam" ? Math.min(1, this.wind / 0.7) : 0;
  const walk = this.phase === "slam" ? 0 : Math.sin(this.t * 3.4);
  limb(ctx, -10, -18, 0.15 + walk * 0.2, 28, 12, "#1c1a20");
  limb(ctx, 10, -18, 0.05 - walk * 0.2, 28, 12, "#16141a");
  ctx.fillStyle = this.hurt ? "#ccc" : "#2a2830";
  ctx.beginPath(); ctx.moveTo(-22, -92); ctx.lineTo(22, -92); ctx.lineTo(18, -16); ctx.lineTo(-18, -16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3a3840"; ctx.fillRect(-20, -70, 40, 10);
  ctx.fillStyle = "#121014"; ctx.fillRect(-12, -112, 24, 22);
  ctx.fillStyle = "#c9a24a"; ctx.fillRect(-6, -96, 12, 4);
  const armA = -0.4 - stomp * 1.8;
  limb(ctx, 20, -78, armA, 26, 10, "#222028");
  ctx.save(); ctx.translate(20 + Math.sin(armA) * 26, -78 + Math.cos(armA) * 26);
  ctx.fillStyle = "#c9a24a"; ctx.beginPath(); ctx.arc(0, 8, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a6a28"; ctx.beginPath(); ctx.arc(0, 8, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (this.phase === "slam" && EV.kit) EV.kit.draw(ctx, "flare_01", 8, -20, 80 + stomp * 40, 0.35 + stomp * 0.3, 0);
};
EVEnemy.prototype.drawFang = function (ctx) {
  const wlk = Math.sin(this.t * 9);
  const stab = this.phase === "stab" ? 1 : 0;
  limb(ctx, -5, -10, 0.15 + wlk * 0.55, 24, 6, "#140e18");
  limb(ctx, 5, -10, 0.1 - wlk * 0.55, 24, 6, "#1a121c");
  ctx.fillStyle = this.hurt ? "#eee" : "#1c1020";
  ctx.beginPath(); ctx.moveTo(-8, -78); ctx.lineTo(8, -78); ctx.lineTo(6, -8); ctx.lineTo(-6, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#c9a24a"; ctx.fillRect(-7, -48, 14, 3);
  ctx.fillStyle = "#2a1814"; ctx.beginPath(); ctx.ellipse(0, -88, 5.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a1020";
  ctx.beginPath(); ctx.moveTo(2, -92); ctx.quadraticCurveTo(22, -70, 8, -40); ctx.lineTo(2, -50); ctx.closePath(); ctx.fill();
  limb(ctx, -10, -68, -0.8 + wlk * 0.4, 22, 5, "#161018");
  limb(ctx, 10, -68, 0.9 - stab * 1.8, 22, 5, "#161018");
  ctx.save(); ctx.translate(10 + Math.sin(0.9 - stab * 1.8) * 22, -68 + Math.cos(0.9 - stab * 1.8) * 22);
  ctx.fillStyle = "#d8d0c8"; ctx.fillRect(0, 0, 14, 2); ctx.restore();
};
EVEnemy.prototype.draw = function (ctx) {
  const h = (this.id === "ironbell" ? 230 : 200) * this.scale;
  ctx.save(); ctx.translate(this.x, this.y);
  ctx.fillStyle = "rgba(0,0,0,0.48)"; ctx.beginPath(); ctx.ellipse(0, 5, 22 * this.scale, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.scale(this.dir * this.scale, this.scale);
  if (this.id === "ironbell") this.drawBell(ctx);
  else if (this.id === "silkfang") this.drawFang(ctx);
  else this.drawAsh(ctx);
  ctx.restore();
  if (!this.dead) {
    const top = this.y - h - 8;
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(this.x - 30, top, 60, 6);
    ctx.fillStyle = "#e24b4b"; ctx.fillRect(this.x - 30, top, 60 * (this.hp / this.max), 6);
  }
};
