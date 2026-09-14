(function () {
  const CKEY = "ev-comments-v1";
  const IKEY = "ev-ideas-v1";
  const RKEY = "ev-ratings-v1";
  const NKEY = "ev-notifs-v1";
  const GKEY = "ev-guest-commented";
  const CDKEY = "ev-comment-cd";

  const commentsEl = document.getElementById("comments");
  const inboxEl = document.getElementById("inbox");
  const inboxCount = document.getElementById("inboxCount");
  const notifEl = document.getElementById("notifs");
  const rateAvg = document.getElementById("rateAvg");

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (e) { return fallback; }
  }
  function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function who() {
    const u = EVAuth.current();
    return u ? u.name : "Gast";
  }
  function owner() { return EVAuth.isOwner(); }

  function addNotif(to, text) {
    if (!to || to === "Gast") return;
    const all = load(NKEY, {});
    all[to] = all[to] || [];
    all[to].unshift({ id: uid(), text: text, time: Date.now(), read: false });
    save(NKEY, all);
  }

  function canComment() {
    if (owner()) return true;
    const user = EVAuth.current();
    if (!user && localStorage.getItem(GKEY) === "1") return "Gäste dürfen nur einen Kommentar schreiben.";
    const last = Number(localStorage.getItem(CDKEY + who()) || 0);
    if (Date.now() - last < 5 * 60 * 1000) return "Nächster Kommentar in 5 Minuten.";
    return true;
  }

  function markCommented() {
    if (owner()) return;
    localStorage.setItem(CDKEY + who(), String(Date.now()));
    if (!EVAuth.current()) localStorage.setItem(GKEY, "1");
  }

  function comments() { return load(CKEY, []); }
  function ideas() { return load(IKEY, []); }

  function renderNotifs() {
    const user = EVAuth.current();
    if (!user) { notifEl.innerHTML = ""; return; }
    const list = (load(NKEY, {})[user.name] || []).slice(0, 5);
    if (!list.length) { notifEl.innerHTML = ""; return; }
    notifEl.innerHTML = list.map((n) => "<div class=\"note\">" + esc(n.text) + "</div>").join("");
  }

  function renderInbox() {
    const list = ideas();
    inboxCount.textContent = String(list.length);
    if (!owner()) {
      inboxEl.innerHTML = "<p class=\"muted\">Nur der Owner sieht den Inhalt.</p>";
      return;
    }
    if (!list.length) {
      inboxEl.innerHTML = "<p class=\"muted\">Inbox leer.</p>";
      return;
    }
    inboxEl.innerHTML = list.map((i) =>
      "<article class=\"idea\"><strong>" + esc(i.author) + "</strong><p>" + esc(i.text) + "</p></article>"
    ).join("");
  }

  function renderRates() {
    const rates = load(RKEY, []);
    if (!rates.length) { rateAvg.textContent = "Noch keine Bewertung"; return; }
    const avg = rates.reduce((a, b) => a + b.stars, 0) / rates.length;
    rateAvg.textContent = avg.toFixed(1) + " / 5 · " + rates.length + " Stimmen";
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function commentHTML(c, nested) {
    const badge = EVAuth.isOwner(c.author)
      ? "<span class=\"owner-badge\">OWNER</span>"
      : "";
    const tools = owner()
      ? "<button data-act=\"pin\" data-id=\"" + c.id + "\">" + (c.pinned ? "Lösen" : "Fixieren") + "</button>" +
        "<button data-act=\"del\" data-id=\"" + c.id + "\">Löschen</button>"
      : "";
    const replies = (c.replies || []);
    const replyBlock = replies.length
      ? "<details class=\"thread\"><summary>Antworten (" + replies.length + ")</summary>" +
        replies.map((r) => commentHTML(r, true)).join("") + "</details>"
      : "";
    return "<article class=\"cmt" + (c.pinned ? " pinned" : "") + " data-id=\"" + c.id + "\">" +
      "<header><strong>" + esc(c.author) + "</strong>" + badge + (c.pinned ? "<span class=\"pin\">oben</span>" : "") + "</header>" +
      "<p>" + esc(c.text) + "</p>" +
      "<div class=\"cmt-actions\">" +
        "<button data-act=\"like\" data-id=\"" + c.id + "\">Like" + (c.likedByOwner ? " · Nyrmus" : "") + "</button>" +
        (nested ? "" : "<button data-act=\"reply\" data-id=\"" + c.id + "\">Antworten</button>") +
        tools +
      "</div>" + replyBlock + "</article>";
  }

  function renderComments() {
    const list = comments().slice().sort((a, b) => (b.pinned - a.pinned) || (b.time - a.time));
    commentsEl.innerHTML = list.length ? list.map((c) => commentHTML(c, false)).join("") : "<p class=\"muted\">Noch keine Kommentare.</p>";
  }

  function find(list, id) {
    for (const c of list) {
      if (c.id === id) return c;
      const r = (c.replies || []).find((x) => x.id === id);
      if (r) return r;
    }
    return null;
  }

  document.getElementById("commentForm").onsubmit = function (e) {
    e.preventDefault();
    const ok = canComment();
    const box = document.getElementById("commentText");
    const err = document.getElementById("commentErr");
    if (ok !== true) { err.textContent = ok; return; }
    const text = box.value.trim();
    if (!text) return;
    const list = comments();
    list.push({ id: uid(), author: who(), text: text, time: Date.now(), pinned: false, likedByOwner: false, replies: [] });
    save(CKEY, list);
    markCommented();
    box.value = "";
    err.textContent = "";
    renderComments();
  };

  document.getElementById("ideaForm").onsubmit = function (e) {
    e.preventDefault();
    const text = document.getElementById("ideaText").value.trim();
    if (!text) return;
    const list = ideas();
    list.unshift({ id: uid(), author: who(), text: text, time: Date.now() });
    save(IKEY, list);
    document.getElementById("ideaText").value = "";
    renderInbox();
  };

  document.querySelectorAll("[data-star]").forEach((btn) => {
    btn.onclick = function () {
      const stars = Number(btn.getAttribute("data-star"));
      const rates = load(RKEY, []).filter((r) => r.who !== who());
      rates.push({ who: who(), stars: stars });
      save(RKEY, rates);
      renderRates();
    };
  });

  commentsEl.addEventListener("click", function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.getAttribute("data-act");
    const id = btn.getAttribute("data-id");
    const list = comments();
    if (act === "reply") {
      const text = prompt("Antwort:");
      if (!text) return;
      const ok = canComment();
      if (ok !== true) { document.getElementById("commentErr").textContent = ok; return; }
      const parent = list.find((c) => c.id === id);
      if (!parent) return;
      parent.replies = parent.replies || [];
      parent.replies.push({ id: uid(), author: who(), text: text.trim(), time: Date.now(), replies: [] });
      save(CKEY, list);
      markCommented();
      renderComments();
      return;
    }
    if (act === "like") {
      const c = find(list, id);
      if (!c) return;
      if (owner()) {
        c.likedByOwner = true;
        addNotif(c.author, "Nyrmus hat reagiert");
      }
      save(CKEY, list);
      renderComments();
      renderNotifs();
      return;
    }
    if (!owner()) return;
    if (act === "pin") {
      const c = list.find((x) => x.id === id);
      if (c) c.pinned = !c.pinned;
      save(CKEY, list);
      renderComments();
    }
    if (act === "del") {
      const next = list.filter((x) => x.id !== id).map((x) => {
        x.replies = (x.replies || []).filter((r) => r.id !== id);
        return x;
      });
      save(CKEY, next);
      renderComments();
    }
  });

  renderComments();
  renderInbox();
  renderRates();
  renderNotifs();
})();
