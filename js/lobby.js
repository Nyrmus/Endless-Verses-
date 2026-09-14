(function () {
  const locker = document.getElementById("locker");
  const slotsEl = document.getElementById("slots");
  const itemsEl = document.getElementById("items");
  const doll = document.getElementById("dollStats");
  let active = "weapon";

  function renderSlots() {
    const eq = EVLoadout.get();
    slotsEl.innerHTML = EVLoadout.SLOTS.map((s) => {
      const it = EVLoadout.find(s, eq[s]);
      return "<button type=\"button\" class=\"slot r-" + it.r + (s === active ? " on" : "") + "\" data-slot=\"" + s + "\">" +
        "<small>" + EVLoadout.LABELS[s] + "</small><b>" + it.name + "</b></button>";
    }).join("");
    doll.innerHTML = EVLoadout.SLOTS.map((s) => {
      const it = EVLoadout.find(s, eq[s]);
      return "<li class=\"r-" + it.r + "\"><span>" + EVLoadout.LABELS[s] + "</span><em>" + it.name + "</em></li>";
    }).join("");
  }

  function renderItems() {
    const eq = EVLoadout.get();
    itemsEl.innerHTML = EVLoadout.ITEMS[active].map((it) => {
      return "<button type=\"button\" class=\"item r-" + it.r + (eq[active] === it.id ? " on" : "") + "\" data-id=\"" + it.id + "\">" +
        "<b>" + it.name + "</b><small>" + it.r + "</small></button>";
    }).join("");
  }

  function draw() { renderSlots(); renderItems(); }

  slotsEl.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-slot]");
    if (!btn) return;
    active = btn.getAttribute("data-slot");
    draw();
  });
  itemsEl.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;
    EVLoadout.set(active, btn.getAttribute("data-id"));
    draw();
  });
  document.getElementById("openLocker").onclick = function () { locker.classList.add("on"); draw(); };
  document.getElementById("closeLocker").onclick = function () { locker.classList.remove("on"); };
  draw();
})();
