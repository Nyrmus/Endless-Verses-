window.EVNinja = function (opts) {
  const o = opts || {};
  this.x = o.x || 240;
  this.y = o.y || 210;
  this.dir = 1;
  this.vx = 0;
  this.vy = 0;
  this.onGround = true;
  this.state = "idle";
  this.t = 0;
  this.anim = 0;
  this.stamina = 100;
  this.knives = 6;
  this.reload = 0;
  this.parryT = 0;
  this.scale = o.scale || 1;
  this.pose = {
    hip: 0, torso: 0,
    lu: 0.2, ll: 0.15, ru: -0.25, rl: 0.2,
    la: 0.4, lf: 0.2, ra: -0.35, rf: 0.15,
    head: 0
  };
};
EVNinja.prototype.setState = function (s) {
  if (this.state === "parry" && this.parryT > 0) return;
  if (this.state === "throw" && this.anim < 0.42) return;
  if (this.state === "reload" && this.anim < 0.28) return;
  this.state = s;
  this.anim = 0;
};
EVNinja.prototype.parry = function () {
  if (this.stamina < 18) return false;
  if (this.state === "parry") return false;
  this.stamina -= 18;
  this.state = "parry";
  this.anim = 0;
  this.parryT = 1.3;
  if (window.EV && EV.audio) EV.audio.parry();
  return true;
};
EVNinja.prototype.dash = function () {
  if (this.stamina < 22 || this.state === "parry") return false;
  this.stamina -= 22;
  this.state = "dash";
  this.anim = 0;
  this.vx = this.dir * 320;
  if (window.EV && EV.audio) EV.audio.dash();
  return true;
};
EVNinja.prototype.throwKnife = function () {
  if (this.state === "parry") return null;
  if (this.knives <= 0) {
    this.setState("reload");
    if (window.EV && EV.audio) EV.audio.whoosh();
    return "reload";
  }
  this.setState("throw");
  this.knives -= 1;
  if (window.EV && EV.audio) EV.audio.throw();
  return "throw";
};
EVNinja.prototype.update = function (dt, input) {
  this.t += dt;
  this.anim += dt;
  this.stamina = Math.min(100, this.stamina + 12 * dt);
  if (this.parryT > 0) {
    this.parryT -= dt;
    if (this.parryT <= 0) this.state = "idle";
  }
  if (this.state === "reload" && this.anim > 0.32) {
    this.knives = 6;
    this.state = "idle";
  }
  if (this.state === "throw" && this.anim > 0.45) this.state = "idle";
  if (this.state === "dash" && this.anim > 0.22) this.state = input.run ? "run" : "idle";

  if (this.state !== "parry" && this.state !== "throw" && this.state !== "reload") {
    if (!this.onGround) this.state = "jump";
    else if (input.run) this.state = "run";
    else if (this.state !== "dash") this.state = "idle";
  }
  this.applyPose();
};
EVNinja.prototype.applyPose = function () {
  const a = this.anim;
  const p = this.pose;
  const L = EV.parts.lerp;
  if (this.state === "idle") {
    const b = Math.sin(this.t * 3) * 0.04;
    p.torso = b; p.hip = -b * 0.5; p.head = -b * 0.3;
    p.lu = 0.15 + b; p.ll = 0.12; p.ru = -0.18; p.rl = 0.16;
    p.la = 0.35; p.lf = 0.2; p.ra = -0.4; p.rf = 0.1;
  } else if (this.state === "run") {
    const s = Math.sin(this.t * 12);
    p.torso = 0.12; p.hip = s * 0.08;
    p.lu = s * 0.7; p.ll = 0.35 + s * 0.35;
    p.ru = -s * 0.7; p.rl = 0.35 - s * 0.35;
    p.la = -s * 0.8; p.ra = s * 0.8; p.lf = 0.2; p.rf = 0.2;
    p.head = -0.08;
  } else if (this.state === "jump") {
    p.torso = -0.15; p.lu = -0.5; p.ll = 0.7; p.ru = 0.2; p.rl = 0.4;
    p.la = -1.1; p.ra = 0.6; p.head = 0.1;
  } else if (this.state === "throw") {
    const k = EV.parts.clamp(a / 0.45, 0, 1);
    p.ra = L(0.2, -2.4, k); p.rf = L(0.2, 0.5, k);
    p.torso = L(0, -0.25, k); p.la = 0.5;
  } else if (this.state === "reload") {
    const k = EV.parts.clamp(a / 0.32, 0, 1);
    p.ra = L(-0.2, 0.9, k); p.rf = L(0.1, 1.1, k);
    p.torso = 0.2;
  } else if (this.state === "parry") {
    p.torso = -0.05; p.la = -0.9; p.lf = 1.2; p.ra = 0.8; p.rf = 0.9;
    p.lu = 0.25; p.ru = -0.15; p.head = -0.05;
  } else if (this.state === "dash") {
    p.torso = 0.35; p.la = -1.4; p.ra = 1.2; p.lu = 0.8; p.ru = -0.6; p.head = 0.15;
  }
};
EVNinja.prototype.draw = function (ctx, weapon) {
  const d = this.dir;
  const s = this.scale;
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.scale(d * s, s);
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.fillStyle = "#0b0b10";
  const p = this.pose;
  function limb(ang1, len1, ang2, len2, w) {
    ctx.save();
    ctx.rotate(ang1);
    ctx.fillRect(-w / 2, 0, w, len1);
    ctx.translate(0, len1);
    ctx.rotate(ang2);
    ctx.fillRect(-w / 2 + 0.5, 0, w - 1, len2);
    ctx.restore();
  }
  ctx.save(); ctx.rotate(p.lu); ctx.translate(6, 8); limb(0, 18, p.ll, 18, 7); ctx.restore();
  ctx.save(); ctx.rotate(p.ru); ctx.translate(-6, 8); limb(0, 18, p.rl, 18, 7); ctx.restore();
  ctx.save();
  ctx.rotate(p.torso);
  ctx.fillStyle = "#0a0a0e";
  ctx.beginPath();
  ctx.moveTo(-11, -22); ctx.lineTo(11, -22); ctx.lineTo(13, 10); ctx.lineTo(-13, 10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#16161c";
  ctx.fillRect(-10, -8, 20, 4);
  ctx.save(); ctx.translate(-12, -18); ctx.rotate(p.la); ctx.fillStyle = "#0b0b10"; ctx.fillRect(-3, 0, 6, 16); ctx.translate(0, 16); ctx.rotate(p.lf); ctx.fillRect(-2.5, 0, 5, 14); ctx.restore();
  ctx.save(); ctx.translate(12, -18); ctx.rotate(p.ra); ctx.fillStyle = "#0b0b10"; ctx.fillRect(-3, 0, 6, 16); ctx.translate(0, 16); ctx.rotate(p.rf);
  ctx.fillRect(-2.5, 0, 5, 14);
  if (weapon !== "none") {
    ctx.fillStyle = "#c9c4d4";
    ctx.beginPath();
    ctx.moveTo(0, 14); ctx.lineTo(3, 28); ctx.lineTo(-1, 27); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2a2a32"; ctx.fillRect(-2, 12, 4, 4);
  }
  ctx.restore();
  ctx.fillStyle = "#08080c";
  ctx.beginPath(); ctx.ellipse(0, -30, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a1a22"; ctx.fillRect(-8, -28, 16, 3);
  ctx.restore();
  ctx.fillStyle = "#050508";
  ctx.beginPath(); ctx.moveTo(-6, -38); ctx.lineTo(16, -26); ctx.lineTo(-6, -24); ctx.closePath(); ctx.fill();
  ctx.restore();
};
