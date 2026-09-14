window.EVLoadout = (function () {
  const SLOTS = ["pet", "weapon", "helm", "chest", "pants", "shoes", "armor", "cloak", "gloves"];
  const LABELS = {
    pet: "Pet", weapon: "Waffe", helm: "Helm", chest: "Brust",
    pants: "Hose", shoes: "Schuhe", armor: "Rüstung", cloak: "Mantel", gloves: "Handschuhe"
  };
  const ITEMS = {
    pet: [
      { id: "none", name: "Leer", r: "common" },
      { id: "shade", name: "Schattengeist", r: "rare" },
      { id: "ember", name: "Funkenwolf", r: "epic" }
    ],
    weapon: [
      { id: "none", name: "Leer", r: "common" },
      { id: "blade", name: "Leerenklinge", r: "epic" },
      { id: "staff", name: "Versstab", r: "legendary" }
    ],
    helm: [
      { id: "none", name: "Leer", r: "common" },
      { id: "iron", name: "Eisenvisier", r: "rare" },
      { id: "veil", name: "Schleierkrone", r: "legendary" }
    ],
    chest: [
      { id: "none", name: "Leer", r: "common" },
      { id: "plate", name: "Plattenbrust", r: "rare" },
      { id: "wrap", name: "Seidenwickel", r: "epic" }
    ],
    pants: [
      { id: "none", name: "Leer", r: "common" },
      { id: "greaves", name: "Beinschienen", r: "rare" },
      { id: "cloth", name: "Wanderhose", r: "common" }
    ],
    shoes: [
      { id: "none", name: "Leer", r: "common" },
      { id: "boots", name: "Marschstiefel", r: "rare" },
      { id: "light", name: "Leichttritt", r: "epic" }
    ],
    armor: [
      { id: "none", name: "Leer", r: "common" },
      { id: "mail", name: "Kettenhemd", r: "rare" },
      { id: "glass", name: "Glaspanzer", r: "legendary" }
    ],
    cloak: [
      { id: "none", name: "Leer", r: "common" },
      { id: "night", name: "Nachtmantel", r: "epic" },
      { id: "royal", name: "Königsumhang", r: "legendary" }
    ],
    gloves: [
      { id: "none", name: "Leer", r: "common" },
      { id: "grip", name: "Griffleder", r: "rare" },
      { id: "arc", name: "Funkenhand", r: "epic" }
    ]
  };

  function key() {
    const u = window.EVAuth && EVAuth.current();
    return "ev-loadout-" + (u ? u.name : "guest");
  }
  function empty() {
    const o = {};
    SLOTS.forEach((s) => { o[s] = "none"; });
    return o;
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
