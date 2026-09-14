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
  if (this.state === "reload" && this.anim > 0.3) { this.knives = 6; this.state = "idle"; }
  if (this.state === "throw" && this.anim > 0.42) this.state = "idle";
  if (this.state === "dash" && this.anim > 0.2) this.state = input.run ? "run" : "idle";
  if (this.state !== "parry" && this.state !== "throw" && this.state !== "reload") {
    if (!this.onGround) this.state = "jump";
    else if (input.run) this.state = "run";
    else if (this.state !== "dash") this.state = "idle";
  }
};
EVNinja.prototype.spriteKey = function () {
  const s = this.state;
  if (s === "run" || s === "dash") return "run";
  if (s === "jump" || s === "throw") return "jump";
  if (s === "parry") return "parry";
  return "idle";
};
EVNinja.prototype.draw = function (ctx) {
  const art = window.EVArt && EVArt.imgs && EVArt.imgs[this.spriteKey()];
  if (art && art.width) {
    const h = 210 * this.scale, w = h * (art.width / art.height);
    ctx.save(); ctx.translate(this.x, this.y);
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.ellipse(0, 4, 26 * this.scale, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.scale(this.dir, 1);
    ctx.drawImage(art, -w / 2, -h + 6, w, h);
    ctx.restore(); return;
  }
  const S = this.scale, bob = this.state === "idle" ? Math.sin(this.t * 2.2) * 1.4 : 0;
  const run = this.state === "run" ? Math.sin(this.t * 11) : 0;
  ctx.save(); ctx.translate(this.x, this.y + bob); ctx.scale(this.dir * S, S);
  ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.ellipse(0, 4, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
  const thigh = this.state === "run" ? run * 0.55 : (this.state === "jump" ? -0.4 : 0.08);
  const thighB = this.state === "run" ? -run * 0.55 : 0.12;
  ctx.save(); ctx.translate(-6, -6); ctx.rotate(thigh);
  ctx.fillStyle = "#0c0c12"; ctx.fillRect(-5, 0, 10, 28);
  ctx.translate(0, 28); ctx.rotate(0.12 + (this.state === "run" ? Math.max(0, run) * 0.4 : 0.08));
  ctx.fillStyle = "#09090e"; ctx.fillRect(-4, 0, 8, 26); ctx.fillStyle = "#16141c"; ctx.fillRect(-5, 24, 10, 5);
  ctx.restore();
  ctx.save(); ctx.translate(6, -6); ctx.rotate(thighB);
  ctx.fillStyle = "#101018"; ctx.fillRect(-5, 0, 10, 28);
  ctx.translate(0, 28); ctx.rotate(0.1);
  ctx.fillStyle = "#0a0a10"; ctx.fillRect(-4, 0, 8, 26); ctx.fillStyle = "#16141c"; ctx.fillRect(-5, 24, 10, 5);
  ctx.restore();
  ctx.fillStyle = "#0b0b12";
  ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(9, -8); ctx.lineTo(7, 2); ctx.lineTo(-7, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#14141c";
  ctx.beginPath(); ctx.moveTo(-16, -38); ctx.lineTo(16, -38); ctx.lineTo(10, -8); ctx.lineTo(-10, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#2a2438"; ctx.fillRect(-11, -22, 22, 3);
  ctx.fillStyle = "#0a0a10";
  ctx.beginPath(); ctx.moveTo(-18, -36); ctx.lineTo(-6, -34); ctx.lineTo(-8, -6); ctx.lineTo(-16, -8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(18, -36); ctx.lineTo(6, -34); ctx.lineTo(8, -6); ctx.lineTo(16, -8); ctx.closePath(); ctx.fill();
  const arm = this.state === "throw" ? -2.2 : (this.state === "parry" ? 0.7 : (this.state === "run" ? run * 0.7 : -0.25));
  const armL = this.state === "parry" ? -0.9 : (this.state === "run" ? -run * 0.7 : 0.3);
  ctx.save(); ctx.translate(-15, -34); ctx.rotate(armL);
  ctx.fillStyle = "#101018"; ctx.fillRect(-3.5, 0, 7, 22);
  ctx.translate(0, 22); ctx.rotate(0.2); ctx.fillRect(-3, 0, 6, 18);
  ctx.restore();
  ctx.save(); ctx.translate(15, -34); ctx.rotate(arm);
  ctx.fillStyle = "#101018"; ctx.fillRect(-3.5, 0, 7, 22);
  ctx.translate(0, 22); ctx.rotate(this.state === "reload" ? 1.0 : 0.15); ctx.fillRect(-3, 0, 6, 18);
  ctx.fillStyle = "#d8d2dc"; ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(3, 34); ctx.lineTo(-1, 33); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#1a1614"; ctx.beginPath(); ctx.ellipse(0, -48, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#07070c"; ctx.beginPath(); ctx.moveTo(-8, -50); ctx.quadraticCurveTo(2, -66, 16, -44); ctx.lineTo(6, -42); ctx.quadraticCurveTo(0, -52, -8, -44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#c9a24a"; ctx.fillRect(-5, -46, 3, 2); ctx.fillRect(1, -46, 3, 2);
  if (this.state === "parry") {
    EV.kit.draw(ctx, "slash_02", 8, -40, 90, 0.45, 0.4);
    EV.kit.draw(ctx, "light_01", 0, -30, 120, 0.2, 0);
  }
  if (this.state === "dash") EV.kit.draw(ctx, "smoke_06", -20, -20, 70, 0.25, 0);
  ctx.restore();
};
