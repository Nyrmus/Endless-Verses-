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

window.EVEnemy = function (spec) {
  this.id = spec.id; this.name = spec.name; this.x = spec.x; this.y = spec.y;
  this.dir = -1; this.hp = spec.hp; this.max = spec.hp; this.atk = spec.atk || 12;
  this.range = spec.range || 70; this.wind = 0; this.cd = 0.8 + Math.random();
  this.hurt = 0; this.dead = false; this.t = 0; this.scale = spec.scale || 1;
  this.phase = "idle"; this.home = spec.x; this.vx = 0;
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
    if (this.cd <= 0 && dist < 90) { this.cd = 1.2; return "strike"; }
  }
  return null;
};
EVEnemy.prototype.hit = function (dmg) {
  if (this.dead) return;
  this.hp -= dmg; this.hurt = 0.16;
  if (this.hp <= 0) { this.hp = 0; this.dead = true; }
};
EVEnemy.prototype.draw = function (ctx) {
  const img = window.EVArt && EVArt.imgs && EVArt.imgs[this.id];
  const h = (this.id === "ironbell" ? 230 : 200) * this.scale;
  ctx.save(); ctx.translate(this.x, this.y);
  ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.ellipse(0, 5, 28 * this.scale, 6, 0, 0, Math.PI * 2); ctx.fill();
  if (img && img.width) {
    const w = h * (img.width / img.height);
    ctx.scale(this.dir, 1);
    if (this.hurt) ctx.filter = "brightness(2)";
    ctx.drawImage(img, -w / 2, -h + 6, w, h); ctx.filter = "none";
  } else {
    ctx.scale(this.dir * this.scale, this.scale);
    if (this.id === "ironbell") {
      ctx.fillStyle = this.hurt ? "#ddd" : "#2c2a30";
      ctx.fillRect(-20, -96, 40, 96);
      ctx.fillStyle = "#c9a24a"; ctx.beginPath(); ctx.arc(-22, -78, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1a1a20"; ctx.fillRect(-10, -118, 20, 24);
      if (this.phase === "slam") EV.kit.draw(ctx, "flare_01", 0, -40, 90, 0.5, 0);
    } else if (this.id === "silkfang") {
      ctx.fillStyle = this.hurt ? "#eee" : "#1a1020";
      ctx.beginPath(); ctx.moveTo(-10, -88); ctx.lineTo(10, -88); ctx.lineTo(8, 0); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#c9a24a"; ctx.fillRect(-7, -50, 14, 4);
      ctx.fillStyle = "#2a1a18"; ctx.beginPath(); ctx.ellipse(0, -98, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = this.hurt ? "#ccc" : "#141018";
      ctx.beginPath(); ctx.moveTo(-12, -92); ctx.lineTo(12, -90); ctx.lineTo(8, 0); ctx.lineTo(-16, 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#e8dcc4"; ctx.beginPath(); ctx.ellipse(0, -100, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c9a24a"; ctx.fillRect(-3, -102, 2, 2); ctx.fillRect(2, -102, 2, 2);
      if (this.phase === "blink") EV.kit.draw(ctx, "smoke_06", 0, -40, 80, 0.4, 0);
    }
  }
  ctx.restore();
  if (!this.dead) {
    const top = this.y - h - 10;
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(this.x - 30, top, 60, 6);
    ctx.fillStyle = "#e24b4b"; ctx.fillRect(this.x - 30, top, 60 * (this.hp / this.max), 6);
  }
};
