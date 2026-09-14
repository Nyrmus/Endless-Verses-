(function () {
  const locker = document.getElementById("locker");
  const slotsEl = document.getElementById("slots");
  const itemsEl = document.getElementById("items");
  const doll = document.getElementById("dollStats");
  let active = "weapon";

  function renderSlots() {
    const eq = EVLoadout.get();
    slotsEl.innerHTML = EVLoadout.SLOTS.map((s) => {
      const on = s === active ? " on" : "";
      return "<button type=\"button\" class=\"slot" + on + "\" data-slot=\"" + s + "\">" +
        "<small>" + EVLoadout.LABELS[s] + "</small>" +
        "<b>" + EVLoadout.nameOf(s, eq[s]) + "</b></button>";
    }).join("");
    doll.innerHTML = EVLoadout.SLOTS.map((s) =>
      "<li><span>" + EVLoadout.LABELS[s] + "</span><em>" + EVLoadout.nameOf(s, eq[s]) + "</em></li>"
    ).join("");
  }

  function renderItems() {
    const eq = EVLoadout.get();
    itemsEl.innerHTML = EVLoadout.ITEMS[active].map((it) => {
      const on = eq[active] === it.id ? " on" : "";
      return "<button type=\"button\" class=\"item" + on + "\" data-id=\"" + it.id + "\">" + it.name + "</button>";
    }).join("");
  }

  function draw() {
    renderSlots();
    renderItems();
  }

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

  document.getElementById("openLocker").onclick = function () {
    locker.classList.add("on");
    draw();
  };
  document.getElementById("closeLocker").onclick = function () {
    locker.classList.remove("on");
  };

  draw();
})();
