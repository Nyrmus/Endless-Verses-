window.EVLoadout = (function () {
  const SLOTS = ["pet", "weapon", "helm", "chest", "pants", "shoes", "armor", "cloak", "gloves"];
  const LABELS = {
    pet: "Pet", weapon: "Waffe", helm: "Helm", chest: "Brust",
    pants: "Hose", shoes: "Schuhe", armor: "Rüstung", cloak: "Mantel", gloves: "Handschuhe"
  };
  const ITEMS = {
    pet: [
      { id: "none", name: "Leer", r: "common" },
      { id: "shade", name: "Schattengeist", r: "rare" }
    ],
    weapon: [
      { id: "blade", name: "Wurfmesser", r: "rare" },
      { id: "obsidian", name: "Obsidian-Messer", r: "epic" },
      { id: "veil", name: "Schleier-Messer", r: "legendary" },
      { id: "none", name: "Leer", r: "common" }
    ],
    helm: [{ id: "none", name: "Leer", r: "common" }, { id: "veil", name: "Schleierhaube", r: "epic" }],
    chest: [{ id: "none", name: "Leer", r: "common" }, { id: "wrap", name: "Nachtwickel", r: "rare" }],
    pants: [{ id: "none", name: "Leer", r: "common" }, { id: "cloth", name: "Schattentuch", r: "rare" }],
    shoes: [{ id: "none", name: "Leer", r: "common" }, { id: "light", name: "Lautlos", r: "epic" }],
    armor: [{ id: "none", name: "Leer", r: "common" }, { id: "mail", name: "Schuppen", r: "rare" }],
    cloak: [{ id: "night", name: "Nachtmantel", r: "epic" }, { id: "none", name: "Leer", r: "common" }],
    gloves: [{ id: "none", name: "Leer", r: "common" }, { id: "grip", name: "Wurfleder", r: "rare" }]
  };
  function key() {
    const u = window.EVAuth && EVAuth.current();
    return "ev-loadout-" + (u ? u.name : "guest");
  }
  function empty() {
    return { pet: "none", weapon: "blade", helm: "none", chest: "none", pants: "none", shoes: "none", armor: "none", cloak: "night", gloves: "none" };
  }
  function get() {
    try { return Object.assign(empty(), JSON.parse(localStorage.getItem(key()) || "{}")); }
    catch (e) { return empty(); }
  }
  function set(slot, id) {
    const data = get();
    data[slot] = id;
    localStorage.setItem(key(), JSON.stringify(data));
    return data;
  }
  function find(slot, id) {
    return (ITEMS[slot] || []).find((x) => x.id === id) || { id: "none", name: "Leer", r: "common" };
  }
  return { SLOTS: SLOTS, LABELS: LABELS, ITEMS: ITEMS, get: get, set: set, find: find };
})();
