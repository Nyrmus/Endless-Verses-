window.EVLoadout = (function () {
  const SLOTS = ["pet", "weapon", "helm", "chest", "pants", "shoes", "armor", "cloak", "gloves"];
  const LABELS = {
    pet: "Pet", weapon: "Waffe", helm: "Helm", chest: "Brust",
    pants: "Hose", shoes: "Schuhe", armor: "Rüstung", cloak: "Mantel", gloves: "Handschuhe"
  };
  const ITEMS = {
    pet: [
      { id: "none", name: "Kein Pet" },
      { id: "shade", name: "Schattengeist" },
      { id: "ember", name: "Funkenwolf" }
    ],
    weapon: [
      { id: "none", name: "Keine Waffe" },
      { id: "blade", name: "Leerenklinge" },
      { id: "staff", name: "Versstab" }
    ],
    helm: [
      { id: "none", name: "Kein Helm" },
      { id: "iron", name: "Eisenvisier" },
      { id: "veil", name: "Schleierkrone" }
    ],
    chest: [
      { id: "none", name: "Keine Brust" },
      { id: "plate", name: "Plattenbrust" },
      { id: "wrap", name: "Seidenwickel" }
    ],
    pants: [
      { id: "none", name: "Keine Hose" },
      { id: "greaves", name: "Beinschienen" },
      { id: "cloth", name: "Wanderhose" }
    ],
    shoes: [
      { id: "none", name: "Keine Schuhe" },
      { id: "boots", name: "Marschstiefel" },
      { id: "light", name: "Leichttritt" }
    ],
    armor: [
      { id: "none", name: "Keine Rüstung" },
      { id: "mail", name: "Kettenhemd" },
      { id: "glass", name: "Glaspanzer" }
    ],
    cloak: [
      { id: "none", name: "Kein Mantel" },
      { id: "night", name: "Nachtmantel" },
      { id: "royal", name: "Königsumhang" }
    ],
    gloves: [
      { id: "none", name: "Keine Handschuhe" },
      { id: "grip", name: "Griffleder" },
      { id: "arc", name: "Funkenhand" }
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
    try {
      return Object.assign(empty(), JSON.parse(localStorage.getItem(key()) || "{}"));
    } catch (e) {
      return empty();
    }
  }

  function set(slot, id) {
    const data = get();
    data[slot] = id;
    localStorage.setItem(key(), JSON.stringify(data));
    return data;
  }

  function nameOf(slot, id) {
    const list = ITEMS[slot] || [];
    const hit = list.find((x) => x.id === id);
    return hit ? hit.name : "—";
  }

  return { SLOTS: SLOTS, LABELS: LABELS, ITEMS: ITEMS, get: get, set: set, nameOf: nameOf };
})();
