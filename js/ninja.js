window.EVNinja = function (opts) {
  const o = opts || {};
  this.x = o.x || 240; this.y = o.y || 210; this.dir = 1;
  this.vx = 0; this.vy = 0; this.onGround = true;
  this.state = "idle"; this.t = 0; this.anim = 0;
  this.stamina = 100; this.knives = 6; this.parryT = 0;
  this.scale = o.scale || 1;
};
EVNinja.prototype.setState = function (s) {
  if (this.state === "parry" && this.parryT > 0) return;
  if (this.state === "throw" && this.anim < 0.38) return;
  this.state = s; this.anim = 0;
};
EVNinja.prototype.parry = function () {
  if (this.stamina < 18 || this.state === "parry") return false;
  this.stamina -= 18; this.state = "parry"; this.anim = 0; this.parryT = 1.3;
  if (EV.audio) EV.audio.parry(); return true;
};
EVNinja.prototype.dash = function () {
  if (this.stamina < 22 || this.state === "parry") return false;
  this.stamina -= 22; this.state = "dash"; this.anim = 0; this.vx = this.dir * 360;
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
  if (this.state === "reload" && this.anim > 0.32) { this.knives = 6; this.state = "idle"; }
  if (this.state === "throw" && this.anim > 0.42) this.state = "idle";
  if (this.state === "dash" && this.anim > 0.22) this.state = input.run ? "run" : "idle";
  if (this.state !== "parry" && this.state !== "throw" && this.state !== "reload" && this.state !== "dash") {
    if (!this.onGround) this.state = "jump";
    else if (input.run) this.state = "run";
    else this.state = "idle";
  }
};
function cap(ctx, x, y, a, len, w, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-w * 0.55, 0);
  ctx.lineTo(w * 0.55, 0);
  ctx.lineTo(w * 0.4, len);
  ctx.lineTo(-w * 0.4, len);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
EVNinja.prototype.pose = function () {
  const s = this.state, t = this.t, a = this.anim;
  const run = s === "run" || s === "dash" ? Math.sin(t * 12.5) : 0;
  const idle = s === "idle" ? Math.sin(t * 2.1) : 0;
  const p = {
    bob: s === "idle" ? idle * 1.6 : (s === "run" ? Math.abs(run) * -3 : 0),
    lean: s === "dash" ? 0.28 : (s === "run" ? 0.1 : (s === "jump" ? 0.05 : 0)),
    hip: 0,
    thighL: 0.08, thighR: 0.12, shinL: 0.1, shinR: 0.08,
    armL: 0.35, armR: -0.28, elL: 0.25, elR: 0.2,
    cloth: idle * 0.12
  };
  if (s === "run" || s === "dash") {
    p.thighL = run * 0.7; p.thighR = -run * 0.7;
    p.shinL = 0.15 + Math.max(0, run) * 0.55;
    p.shinR = 0.15 + Math.max(0, -run) * 0.55;
    p.armL = -run * 0.85; p.armR = run * 0.85;
    p.elL = 0.35; p.elR = 0.35;
    p.cloth = run * 0.2;
  }
  if (s === "jump") {
    p.thighL = -0.55; p.thighR = -0.35; p.shinL = 0.7; p.shinR = 0.55;
    p.armL = -1.1; p.armR = -0.4; p.bob = -6;
  }
  if (s === "throw") {
    const k = Math.min(1, a / 0.18);
    p.armR = -0.2 - k * 2.2; p.elR = 0.1;
    p.armL = 0.5; p.thighR = 0.25;
  }
  if (s === "parry") {
    p.thighL = -0.15; p.thighR = 0.35; p.shinL = 0.35; p.shinR = 0.15;
    p.armL = -0.15; p.armR = 0.85; p.elL = 1.1; p.elR = 0.15; p.lean = -0.08;
  }
  if (s === "reload") { p.armR = 1.15; p.elR = 1.1; p.armL = 0.4; }
  return p;
};
EVNinja.prototype.draw = function (ctx) {
  const S = this.scale, p = this.pose();
  ctx.save();
  ctx.translate(this.x, this.y + p.bob);
  ctx.scale(this.dir * S, S);
  ctx.rotate(p.lean);
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.beginPath(); ctx.ellipse(0, 5, 16, 4.5, 0, 0, Math.PI * 2); ctx.fill();

  cap(ctx, -5.5, -8, p.thighL, 26, 9, "#0b0b12");
  cap(ctx, -5.5 + Math.sin(p.thighL) * 26, -8 + Math.cos(p.thighL) * 26, p.thighL + p.shinL, 24, 7.5, "#08080e");
  ctx.save(); ctx.translate(-5.5 + Math.sin(p.thighL) * 26 + Math.sin(p.thighL + p.shinL) * 24, -8 + Math.cos(p.thighL) * 26 + Math.cos(p.thighL + p.shinL) * 24);
  ctx.rotate(p.thighL + p.shinL); ctx.fillStyle = "#1a1820"; ctx.fillRect(-5, -1, 11, 5); ctx.restore();

  cap(ctx, 5.5, -8, p.thighR, 26, 9, "#12121a");
  cap(ctx, 5.5 + Math.sin(p.thighR) * 26, -8 + Math.cos(p.thighR) * 26, p.thighR + p.shinR, 24, 7.5, "#0a0a10");
  ctx.save(); ctx.translate(5.5 + Math.sin(p.thighR) * 26 + Math.sin(p.thighR + p.shinR) * 24, -8 + Math.cos(p.thighR) * 26 + Math.cos(p.thighR + p.shinR) * 24);
  ctx.rotate(p.thighR + p.shinR); ctx.fillStyle = "#1a1820"; ctx.fillRect(-5, -1, 11, 5); ctx.restore();

  ctx.fillStyle = "#0c0c14";
  ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(8, -10); ctx.lineTo(6.5, 2); ctx.lineTo(-6.5, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#16141e";
  ctx.beginPath(); ctx.moveTo(-15, -40); ctx.lineTo(15, -40); ctx.lineTo(9, -10); ctx.lineTo(-9, -10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#2c2438"; ctx.fillRect(-10, -24, 20, 3);
  ctx.fillStyle = "#c9a24a"; ctx.fillRect(-2, -24, 4, 3);
  ctx.fillStyle = "#08080e";
  ctx.beginPath(); ctx.moveTo(-16, -38); ctx.quadraticCurveTo(-22, -20, -14, -8); ctx.lineTo(-9, -10); ctx.lineTo(-8, -36); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(16, -38); ctx.quadraticCurveTo(22, -20, 14, -8); ctx.lineTo(9, -10); ctx.lineTo(8, -36); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(0, -12); ctx.rotate(p.cloth);
  ctx.fillStyle = "rgba(8,8,14,0.85)";
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(10, 22); ctx.lineTo(-3, 18); ctx.closePath(); ctx.fill();
  ctx.restore();

  cap(ctx, -14, -36, p.armL, 20, 7, "#101018");
  cap(ctx, -14 + Math.sin(p.armL) * 20, -36 + Math.cos(p.armL) * 20, p.armL + p.elL, 18, 6, "#0c0c14");
  cap(ctx, 14, -36, p.armR, 20, 7, "#101018");
  const hx = 14 + Math.sin(p.armR) * 20, hy = -36 + Math.cos(p.armR) * 20;
  cap(ctx, hx, hy, p.armR + p.elR, 18, 6, "#0c0c14");
  ctx.save(); ctx.translate(hx + Math.sin(p.armR + p.elR) * 18, hy + Math.cos(p.armR + p.elR) * 18);
  ctx.rotate(p.armR + p.elR);
  ctx.fillStyle = "#e8e2dc";
  ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(2.2, 16); ctx.lineTo(-0.6, 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#c9a24a"; ctx.fillRect(-2, -2, 4, 4);
  ctx.restore();

  ctx.fillStyle = "#1a1614"; ctx.beginPath(); ctx.ellipse(1, -49, 6.2, 7.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#07070c";
  ctx.beginPath(); ctx.moveTo(-9, -50); ctx.quadraticCurveTo(2, -70, 18, -46); ctx.lineTo(8, -44); ctx.quadraticCurveTo(0, -56, -9, -46); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#0c0c12"; ctx.fillRect(-5, -48, 12, 4);
  ctx.fillStyle = "#e8c86a"; ctx.fillRect(-3.5, -47, 2.4, 1.6); ctx.fillRect(2.2, -47, 2.4, 1.6);

  if (this.state === "parry" && window.EV && EV.kit) {
    EV.kit.draw(ctx, "slash_02", 16, -36, 88, 0.4, 0.5);
    EV.kit.draw(ctx, "light_01", 4, -28, 110, 0.16, 0);
  }
  if (this.state === "dash" && window.EV && EV.kit) EV.kit.draw(ctx, "smoke_06", -18, -16, 64, 0.28, 0);
  ctx.restore();
};
