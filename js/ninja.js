window.EVNinja = function (opts) {
  const o = opts || {};
  this.x = o.x || 240; this.y = o.y || 210; this.dir = 1;
  this.vx = 0; this.vy = 0; this.onGround = true;
  this.state = "idle"; this.t = 0; this.anim = 0;
  this.stamina = 100; this.knives = 6; this.parryT = 0;
  this.scale = o.scale || 1;
  this.poseNow = null;
  this.ghosts = [];
};
EVNinja.prototype.setState = function (s) {
  if (this.state === "parry" && this.parryT > 0) return;
  if (this.state === "throw" && this.anim < 0.34) return;
  this.state = s; this.anim = 0;
};
EVNinja.prototype.parry = function () {
  if (this.stamina < 18 || this.state === "parry") return false;
  this.stamina -= 18; this.state = "parry"; this.anim = 0; this.parryT = 1.3;
  if (EV.audio) EV.audio.parry(); return true;
};
EVNinja.prototype.dash = function () {
  if (this.stamina < 22 || this.state === "parry") return false;
  this.stamina -= 22; this.state = "dash"; this.anim = 0; this.vx = this.dir * 380;
  if (EV.audio) EV.audio.dash(); return true;
};
EVNinja.prototype.throwKnife = function () {
  if (this.state === "parry") return null;
  if (this.knives <= 0) { this.setState("reload"); if (EV.audio) EV.audio.whoosh(); return "reload"; }
  this.setState("throw"); this.knives -= 1; if (EV.audio) EV.audio.throw(); return "throw";
};
EVNinja.prototype.update = function (dt, input) {
  this.t += dt; this.anim += dt;
  this.stamina = Math.min(100, this.stamina + 12 * dt);
  if (this.parryT > 0) { this.parryT -= dt; if (this.parryT <= 0) this.state = "idle"; }
  if (this.state === "reload" && this.anim > 0.36) { this.knives = 6; this.state = "idle"; }
  if (this.state === "throw" && this.anim > 0.4) this.state = "idle";
  if (this.state === "dash" && this.anim > 0.22) this.state = input.run ? "run" : "idle";
  if (this.state !== "parry" && this.state !== "throw" && this.state !== "reload" && this.state !== "dash") {
    if (!this.onGround) this.state = "jump";
    else if (input.run) this.state = "run";
    else this.state = "idle";
  }
  if (this.state === "dash" && this.t % 0.04 < dt) {
    this.ghosts.push({ x: this.x, y: this.y, dir: this.dir, life: 0.18, pose: this.keys() });
  }
  this.ghosts.forEach((g) => { g.life -= dt; });
  this.ghosts = this.ghosts.filter((g) => g.life > 0);
};
function mix(a, b, t) {
  const o = {};
  Object.keys(a).forEach((k) => { o[k] = a[k] + (b[k] - a[k]) * t; });
  return o;
}
function ease(t) { return t * t * (3 - 2 * t); }
EVNinja.prototype.keys = function () {
  const s = this.state, t = this.t, a = this.anim;
  const breath = Math.sin(t * 2.15);
  const run = Math.sin(t * 13.2);
  const base = {
    bob: 0, lean: 0, hip: 0,
    tL: 0.12, tR: 0.16, kL: 0.12, kR: 0.1,
    aL: 0.42, aR: -0.32, eL: 0.28, eR: 0.22,
    cloth: 0.05, hood: 0, squish: 1
  };
  if (s === "idle") {
    return mix(base, {
      bob: breath * 2.2, lean: breath * 0.02, hip: breath * 0.03,
      tL: 0.1 + breath * 0.03, tR: 0.18 - breath * 0.03,
      aL: 0.38 + breath * 0.06, aR: -0.28 - breath * 0.05,
      cloth: breath * 0.14, hood: breath * 0.04
    }, 1);
  }
  if (s === "run" || s === "dash") {
    const dash = s === "dash" ? 1 : 0;
    return {
      bob: Math.abs(run) * -4.2, lean: 0.16 + dash * 0.22, hip: run * 0.08,
      tL: run * 0.82, tR: -run * 0.82,
      kL: 0.18 + Math.max(0, run) * 0.7, kR: 0.18 + Math.max(0, -run) * 0.7,
      aL: -run * 0.95, aR: run * 0.95, eL: 0.42, eR: 0.42,
      cloth: 0.25 + dash * 0.35 + run * 0.12, hood: -0.08 - dash * 0.1, squish: 1
    };
  }
  if (s === "jump") {
    const up = this.vy < 0;
    return {
      bob: up ? -8 : -2, lean: 0.08, hip: 0,
      tL: up ? -0.72 : -0.2, tR: up ? -0.48 : 0.15,
      kL: up ? 0.95 : 0.25, kR: up ? 0.7 : 0.2,
      aL: up ? -1.25 : -0.35, aR: up ? -0.55 : 0.2,
      eL: 0.4, eR: 0.25, cloth: up ? 0.45 : 0.1, hood: up ? -0.12 : 0.06, squish: up ? 1.06 : 0.96
    };
  }
  if (s === "throw") {
    const k = ease(Math.min(1, a / 0.16));
    const rec = a > 0.16 ? ease(Math.min(1, (a - 0.16) / 0.22)) : 0;
    return {
      bob: -k * 3, lean: -0.04 + rec * 0.12, hip: 0.08,
      tL: 0.05, tR: 0.32, kL: 0.18, kR: 0.12,
      aL: 0.55, aR: 0.35 - k * 2.55 + rec * 1.1,
      eL: 0.2, eR: 0.05 + rec * 0.3,
      cloth: 0.2 + k * 0.25, hood: -0.06, squish: 1
    };
  }
  if (s === "parry") {
    const k = ease(Math.min(1, a / 0.12));
    return {
      bob: 1, lean: -0.12 * k, hip: -0.06,
      tL: -0.22, tR: 0.42, kL: 0.42, kR: 0.12,
      aL: -0.2, aR: 0.95 * k, eL: 1.15, eR: 0.08,
      cloth: 0.08, hood: 0.05, squish: 1
    };
  }
  if (s === "reload") {
    const k = ease(Math.min(1, a / 0.18));
    return {
      bob: 1, lean: 0.06, hip: 0.04,
      tL: 0.12, tR: 0.22, kL: 0.14, kR: 0.1,
      aL: 0.35, aR: 0.3 + k * 1.05, eL: 0.25, eR: 0.4 + k * 0.85,
      cloth: 0.1, hood: 0.04, squish: 1
    };
  }
  return base;
};
function bone(ctx, x, y, ang, len, w0, w1, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-w0 * 0.5, 0);
  ctx.lineTo(w0 * 0.5, 0);
  ctx.lineTo(w1 * 0.5, len);
  ctx.lineTo(-w1 * 0.5, len);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  return { x: x + Math.sin(ang) * len, y: y + Math.cos(ang) * len };
}
EVNinja.prototype.paint = function (ctx, p, weapon, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.translate(this.x, this.y + p.bob);
  ctx.scale(this.dir * this.scale, this.scale * (p.squish || 1));
  ctx.rotate(p.lean);
  ctx.fillStyle = "rgba(0,0,0," + (0.42 * (alpha == null ? 1 : alpha)) + ")";
  ctx.beginPath(); ctx.ellipse(0, 6, 17, 4.2, 0, 0, Math.PI * 2); ctx.fill();

  const hipL = bone(ctx, -6.5, -12, p.tL, 30, 11, 8.5, "#0a0a12");
  const footL = bone(ctx, hipL.x, hipL.y, p.tL + p.kL, 28, 8, 6.5, "#07070e");
  ctx.save(); ctx.translate(footL.x, footL.y); ctx.rotate(p.tL + p.kL);
  ctx.fillStyle = "#16141c"; ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(10, 1); ctx.lineTo(9, 5); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
  ctx.restore();

  const hipR = bone(ctx, 6.5, -12, p.tR, 30, 11, 8.5, "#12121a");
  const footR = bone(ctx, hipR.x, hipR.y, p.tR + p.kR, 28, 8, 6.5, "#0a0a12");
  ctx.save(); ctx.translate(footR.x, footR.y); ctx.rotate(p.tR + p.kR);
  ctx.fillStyle = "#1a1820"; ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(10, 1); ctx.lineTo(9, 5); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.save(); ctx.rotate(p.hip);
  ctx.fillStyle = "#0c0c14";
  ctx.beginPath(); ctx.moveTo(-9, -14); ctx.lineTo(9, -14); ctx.lineTo(7, 2); ctx.lineTo(-7, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#17151f";
  ctx.beginPath(); ctx.moveTo(-17, -48); ctx.lineTo(17, -48); ctx.lineTo(10, -14); ctx.lineTo(-10, -14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#2e263c"; ctx.fillRect(-11, -28, 22, 3.5);
  ctx.fillStyle = "#d4af4a"; ctx.fillRect(-2.2, -28, 4.4, 3.5);
  ctx.fillStyle = "#08080e";
  ctx.beginPath(); ctx.moveTo(-17, -46); ctx.quadraticCurveTo(-24, -24, -15, -10); ctx.lineTo(-9, -14); ctx.lineTo(-9, -44); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(17, -46); ctx.quadraticCurveTo(24, -24, 15, -10); ctx.lineTo(9, -14); ctx.lineTo(9, -44); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(1, -12); ctx.rotate(p.cloth);
  ctx.fillStyle = "#09090f";
  ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.quadraticCurveTo(12, 16, 8, 30); ctx.lineTo(-4, 24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#d4af4a"; ctx.fillRect(-1, 2, 2, 16);
  ctx.restore();

  bone(ctx, -16, -44, p.aL, 22, 8, 6.5, "#101018");
  bone(ctx, -16 + Math.sin(p.aL) * 22, -44 + Math.cos(p.aL) * 22, p.aL + p.eL, 20, 6.5, 5.5, "#0c0c14");
  const shR = { x: 16, y: -44 };
  const elR = bone(ctx, shR.x, shR.y, p.aR, 22, 8, 6.5, "#101018");
  const hand = bone(ctx, elR.x, elR.y, p.aR + p.eR, 20, 6.5, 5.5, "#0c0c14");

  if (weapon !== "none") {
    ctx.save(); ctx.translate(hand.x, hand.y); ctx.rotate(p.aR + p.eR + 0.15);
    const blade = weapon === "obsidian" ? "#6a5a88" : (weapon === "veil" ? "#c9b6ff" : "#ece6de");
    ctx.fillStyle = blade;
    ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(2.4, 18); ctx.lineTo(-0.8, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#d4af4a"; ctx.fillRect(-2.2, -2.2, 4.4, 4);
    ctx.restore();
  }

  ctx.save(); ctx.translate(1, -56); ctx.rotate(p.hood);
  ctx.fillStyle = "#1c1816"; ctx.beginPath(); ctx.ellipse(0, 4, 6.4, 7.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#07070c";
  ctx.beginPath(); ctx.moveTo(-10, 2); ctx.quadraticCurveTo(1, -22, 20, 6); ctx.lineTo(8, 8); ctx.quadraticCurveTo(0, -8, -10, 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#0c0c12"; ctx.fillRect(-6, 5, 13, 4.2);
  ctx.fillStyle = "#ffe08a"; ctx.fillRect(-3.8, 6.2, 2.6, 1.5); ctx.fillRect(2.4, 6.2, 2.6, 1.5);
  ctx.restore();
  ctx.restore();
  ctx.restore();
};
EVNinja.prototype.draw = function (ctx, weapon) {
  const p = this.keys();
  this.ghosts.forEach((g) => {
    const old = { x: this.x, y: this.y, dir: this.dir };
    this.x = g.x; this.y = g.y; this.dir = g.dir;
    this.paint(ctx, g.pose, weapon || "blade", Math.max(0, g.life / 0.18) * 0.28);
    this.x = old.x; this.y = old.y; this.dir = old.dir;
  });
  this.paint(ctx, p, weapon || "blade", 1);
  if (this.state === "parry" && window.EV && EV.kit) {
    ctx.save(); ctx.translate(this.x, this.y);
    ctx.scale(this.dir * this.scale, this.scale);
    EV.kit.draw(ctx, "slash_02", 18, -40, 92, 0.42, 0.5);
    EV.kit.draw(ctx, "light_01", 2, -30, 120, 0.16, 0);
    ctx.restore();
  }
};
