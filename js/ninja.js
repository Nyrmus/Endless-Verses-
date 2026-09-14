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
  this.parryT = 0;
  this.scale = o.scale || 1;
  this.pose = {
    hip: 0, torso: 0, head: 0,
    lu: 0.12, ll: 0.18, ru: -0.16, rl: 0.2,
    la: 0.28, lf: 0.18, ra: -0.32, rf: 0.12
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
  if (this.stamina < 18 || this.state === "parry") return false;
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
  this.vx = this.dir * 340;
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
  if (this.state === "reload" && this.anim > 0.32) { this.knives = 6; this.state = "idle"; }
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
  const a = this.anim, p = this.pose, L = EV.parts.lerp;
  if (this.state === "idle") {
    const b = Math.sin(this.t * 2.4) * 0.03;
    p.torso = b; p.head = -b * 0.4;
    p.lu = 0.1 + b; p.ll = 0.16; p.ru = -0.12; p.rl = 0.18;
    p.la = 0.22; p.lf = 0.16; p.ra = -0.28; p.rf = 0.1;
  } else if (this.state === "run") {
    const s = Math.sin(this.t * 10.5);
    p.torso = 0.1; p.hip = s * 0.06; p.head = -0.06;
    p.lu = s * 0.62; p.ll = 0.32 + Math.max(0, s) * 0.38;
    p.ru = -s * 0.62; p.rl = 0.32 + Math.max(0, -s) * 0.38;
    p.la = -s * 0.72; p.ra = s * 0.72; p.lf = 0.18; p.rf = 0.18;
  } else if (this.state === "jump") {
    p.torso = -0.12; p.head = 0.08;
    p.lu = -0.45; p.ll = 0.62; p.ru = 0.18; p.rl = 0.38;
    p.la = -1.05; p.ra = 0.55;
  } else if (this.state === "throw") {
    const k = EV.parts.clamp(a / 0.45, 0, 1);
    p.ra = L(0.15, -2.35, k); p.rf = L(0.12, 0.45, k);
    p.torso = L(0, -0.22, k); p.la = 0.45;
  } else if (this.state === "reload") {
    const k = EV.parts.clamp(a / 0.32, 0, 1);
    p.ra = L(-0.15, 0.85, k); p.rf = L(0.1, 1.05, k); p.torso = 0.18;
  } else if (this.state === "parry") {
    p.torso = -0.04; p.head = -0.04;
    p.la = -0.85; p.lf = 1.15; p.ra = 0.72; p.rf = 0.85;
    p.lu = 0.22; p.ru = -0.12;
  } else if (this.state === "dash") {
    p.torso = 0.32; p.head = 0.12;
    p.la = -1.35; p.ra = 1.15; p.lu = 0.72; p.ru = -0.55;
  }
};
EVNinja.prototype.spriteKey = function () {
  const s = this.state;
  if (s === "run" || s === "dash") return "run";
  if (s === "jump" || s === "throw") return "jump";
  if (s === "parry") return "parry";
  return "idle";
};
EVNinja.prototype.drawSprite = function (ctx, img) {
  const s = this.scale;
  const bob = this.state === "idle" ? Math.sin(this.t * 2.3) * 2.2 : (this.state === "run" ? Math.abs(Math.sin(this.t * 10.5)) * -3 : 0);
  const h = 188 * s;
  const w = h * (img.width / img.height);
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 28 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  if (this.state === "dash") {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.translate(-this.dir * 26 * s, 0);
    ctx.scale(this.dir, 1);
    ctx.drawImage(img, -w / 2, -h + 8 + bob, w, h);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.translate(-this.dir * 48 * s, 0);
    ctx.scale(this.dir, 1);
    ctx.drawImage(img, -w / 2, -h + 8 + bob, w, h);
    ctx.restore();
  }
  ctx.scale(this.dir, 1);
  if (this.state === "parry") {
    ctx.shadowColor = "rgba(190,160,255,0.55)";
    ctx.shadowBlur = 18;
  }
  ctx.drawImage(img, -w / 2, -h + 8 + bob, w, h);
  ctx.restore();
};
EVNinja.prototype.draw = function (ctx, weapon) {
  const art = window.EVArt && EVArt.imgs;
  const img = art && art[this.spriteKey()];
  if (img && img.width) {
    this.drawSprite(ctx, img);
    return;
  }
  const s = this.scale;
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.scale(this.dir * s, s);
  const p = this.pose;

  function bone(w1, len, w2) {
    ctx.beginPath();
    ctx.moveTo(-w1 / 2, 0);
    ctx.lineTo(w1 / 2, 0);
    ctx.lineTo((w2 || w1 * 0.75) / 2, len);
    ctx.lineTo(-(w2 || w1 * 0.75) / 2, len);
    ctx.closePath();
    ctx.fill();
  }
  function cap(x, y, rx, ry, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#121218";
  ctx.save();
  ctx.translate(-7, 2);
  ctx.rotate(p.lu);
  bone(11, 26, 9);
  ctx.translate(0, 26);
  ctx.rotate(p.ll);
  ctx.fillStyle = "#0c0c12";
  bone(9, 25, 7);
  cap(0, 26, 5, 3, "#0a0a10");
  ctx.restore();

  ctx.save();
  ctx.translate(7, 2);
  ctx.rotate(p.ru);
  ctx.fillStyle = "#101016";
  bone(11, 26, 9);
  ctx.translate(0, 26);
  ctx.rotate(p.rl);
  ctx.fillStyle = "#0c0c12";
  bone(9, 25, 7);
  cap(0, 26, 5, 3, "#0a0a10");
  ctx.restore();

  ctx.save();
  ctx.rotate(p.torso);
  ctx.fillStyle = "#0d0d14";
  ctx.beginPath();
  ctx.moveTo(-16, -36);
  ctx.lineTo(16, -36);
  ctx.lineTo(13, 6);
  ctx.lineTo(-11, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#17171f";
  ctx.beginPath();
  ctx.moveTo(-15, -34);
  ctx.lineTo(15, -34);
  ctx.lineTo(11, -8);
  ctx.lineTo(-11, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#0a0a10";
  ctx.fillRect(-10, -6, 20, 4);
  cap(-15, -32, 6, 7, "#14141c");
  cap(15, -32, 6, 7, "#14141c");

  ctx.save();
  ctx.translate(-16, -30);
  ctx.rotate(p.la);
  ctx.fillStyle = "#12121a";
  bone(8, 22, 7);
  ctx.translate(0, 22);
  ctx.rotate(p.lf);
  ctx.fillStyle = "#0e0e16";
  bone(7, 20, 6);
  cap(0, 21, 4.5, 3.5, "#1a1714");
  ctx.restore();

  ctx.save();
  ctx.translate(16, -30);
  ctx.rotate(p.ra);
  ctx.fillStyle = "#12121a";
  bone(8, 22, 7);
  ctx.translate(0, 22);
  ctx.rotate(p.rf);
  ctx.fillStyle = "#0e0e16";
  bone(7, 20, 6);
  cap(0, 21, 4.5, 3.5, "#1a1714");
  if (weapon !== "none") {
    ctx.fillStyle = "#d8d2e0";
    ctx.beginPath();
    ctx.moveTo(1, 18);
    ctx.lineTo(4, 36);
    ctx.lineTo(-1, 35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2b2b34";
    ctx.fillRect(-2, 16, 5, 4);
  }
  ctx.restore();

  ctx.save();
  ctx.rotate(p.head);
  ctx.fillStyle = "#1c1612";
  ctx.beginPath();
  ctx.ellipse(0, -46, 7.2, 8.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a0a0e";
  ctx.beginPath();
  ctx.ellipse(0, -47, 8.2, 9.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#050508";
  ctx.beginPath();
  ctx.moveTo(-8, -50);
  ctx.quadraticCurveTo(2, -64, 18, -44);
  ctx.lineTo(8, -40);
  ctx.quadraticCurveTo(-2, -48, -8, -42);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#0e0e14";
  ctx.fillRect(-7, -44, 14, 3);
  ctx.fillStyle = "#1a1a24";
  ctx.fillRect(-6, -41, 5, 2);
  ctx.restore();
  ctx.restore();
  ctx.restore();
};
