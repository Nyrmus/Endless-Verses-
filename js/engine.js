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
    f.type = "lowpass";
    f.frequency.value = 1400;
    g.gain.setValueAtTime(gain || 0.06, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(f); f.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  }
  return {
    start: function () { ac(); },
    whoosh: function () { tone(180, 0.18, "sawtooth", 0.05); tone(90, 0.22, "triangle", 0.04); },
    throw: function () { tone(520, 0.08, "square", 0.04); tone(220, 0.12, "sawtooth", 0.03); },
    parry: function () { tone(740, 0.07, "square", 0.05); tone(240, 0.2, "triangle", 0.04); },
    dash: function () { tone(140, 0.16, "sawtooth", 0.06); },
    click: function () { tone(420, 0.05, "square", 0.03); },
    coin: function () { tone(880, 0.08, "triangle", 0.04); }
  };
})();

EV.parts = {
  lerp: function (a, b, t) { return a + (b - a) * t; },
  clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); }
};
