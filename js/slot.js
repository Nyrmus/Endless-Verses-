(function () {
  const KEY = "ev-tokens-v1";
  const faces = ["7", "♠", "♥", "♦", "★", "◆"];
  const reels = [document.getElementById("r1"), document.getElementById("r2"), document.getElementById("r3")];
  const tokensEl = document.getElementById("tokens");
  const betEl = document.getElementById("bet");
  const joke = document.getElementById("slotJoke");
  const machine = document.getElementById("slot");
  let spinning = false;

  function tokens() { return Number(localStorage.getItem(KEY) || 100); }
  function setTokens(n) {
    n = Math.max(0, Math.floor(n));
    localStorage.setItem(KEY, String(n));
    tokensEl.textContent = String(n);
  }
  setTokens(tokens());

  function randFace() { return faces[Math.floor(Math.random() * faces.length)]; }

  function rollReel(el, final, delay) {
    return new Promise((resolve) => {
      let i = 0;
      const t = setInterval(() => {
        el.textContent = randFace();
        i += 1;
        if (i > 12 + delay) {
          clearInterval(t);
          el.textContent = final;
          resolve();
        }
      }, 70);
    });
  }

  document.getElementById("spinBtn").onclick = async function () {
    if (spinning) return;
    const bet = Math.max(1, Number(betEl.value || 1));
    if (tokens() < bet) {
      joke.textContent = "Keine Tokens. Morgen wieder 100 — trotzdem wertlos.";
      return;
    }
    spinning = true;
    setTokens(tokens() - bet);
    joke.textContent = "Dreht…";
    machine.classList.remove("jackpot");
    const results = [randFace(), randFace(), randFace()];
    if (Math.random() < 0.08) results[0] = results[1] = results[2] = "7";
    await Promise.all(reels.map((el, i) => rollReel(el, results[i], i * 4)));
    if (results.every((x) => x === "7")) {
      machine.classList.add("jackpot");
      joke.textContent = "777! Du gewinnst… absolut nichts. Community-Applaus.";
      setTokens(tokens() + bet);
    } else {
      joke.textContent = "Verloren. Die Tokens waren eh Fake.";
    }
    spinning = false;
  };
})();
