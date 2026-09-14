window.EVCombat = {
  sparks: [],
  burst: function (x, y, col, n) {
    n = n || 14;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 80 + Math.random() * 260;
      this.sparks.push({
        x: x, y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        life: 0.18 + Math.random() * 0.28,
        max: 0.4,
        col: col || "#ffe08a",
        s: 2 + Math.random() * 3
      });
    }
  },
  update: function (dt) {
    this.sparks.forEach((s) => {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 420 * dt;
      s.life -= dt;
    });
    this.sparks = this.sparks.filter((s) => s.life > 0);
  },
  draw: function (ctx) {
    this.sparks.forEach((s) => {
      ctx.globalAlpha = Math.max(0, s.life / s.max);
      ctx.fillStyle = s.col;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
};

window.EVEnemy = function (spec) {
  this.id = spec.id;
  this.name = spec.name;
  this.x = spec.x;
  this.y = spec.y;
  this.dir = -1;
  this.hp = spec.hp;
  this.max = spec.hp;
  this.atk = spec.atk || 12;
  this.range = spec.range || 70;
  this.wind = 0;
  this.cd = 1.2 + Math.random();
  this.hurt = 0;
  this.dead = false;
  this.t = 0;
  this.scale = spec.scale || 1;
};
EVEnemy.prototype.update = function (dt, ninja) {
  if (this.dead) return;
  this.t += dt;
  this.hurt = Math.max(0, this.hurt - dt);
  this.cd -= dt;
  const dx = ninja.x - this.x;
  this.dir = dx < 0 ? -1 : 1;
  const dist = Math.abs(dx);
  if (dist > this.range + 8) {
    this.x += this.dir * 70 * dt;
    this.wind = 0;
  } else if (this.cd <= 0) {
    this.wind += dt;
    if (this.wind >= 0.55) {
      this.wind = 0;
      this.cd = this.id === "ironbell" ? 1.8 : 1.15;
      return "strike";
    }
  } else this.wind = 0;
  return null;
};
EVEnemy.prototype.hit = function (dmg) {
  if (this.dead) return;
  this.hp -= dmg;
  this.hurt = 0.18;
  if (this.hp <= 0) {
    this.hp = 0;
    this.dead = true;
  }
};
EVEnemy.prototype.draw = function (ctx) {
  if (this.dead && this.hurt <= 0 && this.hp <= 0) {
    ctx.globalAlpha = 0.25;
  }
  const img = window.EVArt && EVArt.imgs && EVArt.imgs[this.id];
  const h = (this.id === "ironbell" ? 210 : 188) * this.scale;
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 30 * this.scale, 7 * this.scale, 0, 0, Math.PI * 2);
  ctx.fill();
  if (img && img.width) {
    const w = h * (img.width / img.height);
    ctx.scale(this.dir, 1);
    if (this.hurt > 0) ctx.filter = "brightness(2.2)";
    ctx.drawImage(img, -w / 2, -h + 8, w, h);
    ctx.filter = "none";
  } else {
    ctx.scale(this.dir * this.scale, this.scale);
    if (this.id === "ironbell") {
      ctx.fillStyle = this.hurt ? "#c8c0b0" : "#3a3632";
      ctx.fillRect(-22, -92, 44, 92);
      ctx.fillStyle = "#b08a3a";
      ctx.fillRect(-34, -88, 18, 28);
    } else if (this.id === "silkfang") {
      ctx.fillStyle = this.hurt ? "#eee" : "#1a1220";
      ctx.fillRect(-12, -86, 24, 86);
      ctx.fillStyle = "#c9a24a";
      ctx.fillRect(-8, -44, 16, 6);
    } else {
      ctx.fillStyle = this.hurt ? "#ddd" : "#161018";
      ctx.fillRect(-14, -90, 28, 90);
      ctx.fillStyle = "#e8dcc0";
      ctx.beginPath(); ctx.ellipse(0, -98, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  if (!this.dead) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(this.x - 28, this.y - ((this.id === "ironbell" ? 210 : 188) * this.scale) - 8, 56, 6);
    ctx.fillStyle = "#e24b4b";
    ctx.fillRect(this.x - 28, this.y - ((this.id === "ironbell" ? 210 : 188) * this.scale) - 8, 56 * (this.hp / this.max), 6);
  }
};
