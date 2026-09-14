window.EVData = {
  tokensKey: "ev-tokens-v1",
  tokens: function () { return Number(localStorage.getItem(this.tokensKey) || 250); },
  setTokens: function (n) { localStorage.setItem(this.tokensKey, String(Math.max(0, n | 0))); },
  monsters: [
    { id: "ashwraith", name: "Ashwraith", role: "Lauerer", hp: 80, atk: "Phasen-Schnitt nach 1.2s Windup", weak: "Licht / Parry auf den zweiten Tick", pattern: "Idle → Blink hinter dich → Doppelhieb", skills: ["Blink", "Rauchschleier"] },
    { id: "ironbell", name: "Ironbell", role: "Tank", hp: 220, atk: "Glockenstoß, Arena-Stun 0.4s", weak: "Rücken / Energy-Break", pattern: "3 Schritte → Schild → Fläche", skills: ["Glocke", "Plattenwall"] },
    { id: "silkfang", name: "Silkfang", role: "Assassine", hp: 70, atk: "Drei Messer in Fächerform", weak: "Dash durch den Fächer", pattern: "Kreis → Sprung → Fächer", skills: ["Fadennetz", "Giftkante"] },
    { id: "voidmonk", name: "Voidmonk", role: "Caster", hp: 95, atk: "Mana-Lanze, 2s Charge", weak: "Interrupt / Parry der Lanze", pattern: "Charge → Lanze → Teleport", skills: ["Lanze", "Leerenritt"] }
  ],
  shop: [
    { id: "pack_s", name: "Splitter-Pack", cost: 40, give: 0, note: "Kosmetik-Token, kein Pay" },
    { id: "knives_obs", name: "Obsidian-Messer", cost: 120, slot: "weapon", item: "obsidian" },
    { id: "knives_veil", name: "Schleier-Messer", cost: 180, slot: "weapon", item: "veil" }
  ],
  mods: [
    { id: "def_iron", type: "defence", name: "Eisenhaut", stars: 1, desc: "Reduziert Treffer-Schaden." },
    { id: "def_shade", type: "defence", name: "Schattenplatte", stars: 1, desc: "Rüstung nach erfolgreichem Parry." },
    { id: "en_flow", type: "energy", name: "Flussader", stars: 1, desc: "Ausdauer regeneriert schneller." },
    { id: "en_burst", type: "energy", name: "Impulsader", stars: 1, desc: "Dash kostet weniger." },
    { id: "mn_well", type: "mana", name: "Brunnen", stars: 1, desc: "Mana-Deckel +20." },
    { id: "mn_edge", type: "mana", name: "Klingenatem", stars: 1, desc: "Messer verbrauchen weniger Mana." }
  ]
};
