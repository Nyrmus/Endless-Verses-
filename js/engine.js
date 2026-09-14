window.EV = window.EV || {};
EV.audio = (function () {
  let ctx;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, gain) {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    const f = a.createBiquadFilter();
    o.type = type || "sawtooth";
    o.frequency.value = freq;
    f.type = "lowpass"; f.frequency.value = 1600;
    g.gain.setValueAtTime(gain || 0.05, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(f); f.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  }
  return {
    start: function () { ac(); },
    whoosh: function () { tone(160, 0.16, "sawtooth", 0.05); },
    throw: function () { tone(540, 0.07, "square", 0.04); },
    parry: function () { tone(820, 0.06, "square", 0.05); tone(240, 0.18, "triangle", 0.04); },
    dash: function () { tone(120, 0.14, "sawtooth", 0.05); },
    click: function () { tone(420, 0.04, "square", 0.03); },
    coin: function () { tone(880, 0.07, "triangle", 0.04); }
  };
})();
EV.parts = {
  lerp: function (a, b, t) { return a + (b - a) * t; },
  clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); }
};
EV.kit = {
  base: "https://cdn.jsdelivr.net/gh/Calinou/kenney-particle-pack@master/addons/kenney_particle_pack/",
  imgs: {},
  load: function () {
    ["flame_01","flame_02","spark_01","spark_02","slash_01","slash_02","smoke_06","light_01","magic_05","flare_01"].forEach((n) => {
      const im = new Image();
      im.src = this.base + n + ".png";
      this.imgs[n] = im;
    });
  },
  draw: function (ctx, name, x, y, s, a, rot) {
    const im = this.imgs[name];
    if (!im || !im.width) return false;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.globalAlpha = a == null ? 1 : a;
    const w = s || 48;
    ctx.drawImage(im, -w / 2, -w / 2, w, w);
    ctx.restore();
    return true;
  }
};
EV.kit.load();
