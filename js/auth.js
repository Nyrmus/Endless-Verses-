window.EVAuth = (function () {
  const USERS = "ev-users-v1";
  const SESSION = "ev-session-v1";
  const OWNER = "Nyrmus";

  async function hash(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function users() {
    try {
      return JSON.parse(localStorage.getItem(USERS) || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeUsers(list) {
    localStorage.setItem(USERS, JSON.stringify(list));
  }

  function current() {
    try {
      const raw = sessionStorage.getItem(SESSION) || localStorage.getItem(SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function isOwner(name) {
    return String(name || (current() && current().name) || "").toLowerCase() === OWNER.toLowerCase();
  }

  async function seedOwner() {
    const list = users();
    if (list.some((u) => u.name.toLowerCase() === OWNER.toLowerCase())) return;
    const passHash = await hash(OWNER.toLowerCase() + ":" + "Vortex200");
    list.push({ name: OWNER, passHash: passHash, created: Date.now(), owner: true });
    writeUsers(list);
  }

  async function register(name, password) {
    name = String(name || "").trim();
    if (name.length < 3) throw new Error("Name zu kurz");
    if (String(password).length < 4) throw new Error("Passwort zu kurz");
    if (name.toLowerCase() === OWNER.toLowerCase()) throw new Error("Name reserviert");
    const list = users();
    if (list.some((u) => u.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Name schon vergeben");
    }
    const passHash = await hash(name.toLowerCase() + ":" + password);
    list.push({ name: name, passHash: passHash, created: Date.now() });
    writeUsers(list);
    const session = { name: name };
    localStorage.setItem(SESSION, JSON.stringify(session));
    sessionStorage.setItem(SESSION, JSON.stringify(session));
    return session;
  }

  async function login(name, password) {
    await seedOwner();
    name = String(name || "").trim();
    const list = users();
    const user = list.find((u) => u.name.toLowerCase() === name.toLowerCase());
    if (!user) throw new Error("Account nicht gefunden");
    const passHash = await hash(user.name.toLowerCase() + ":" + password);
    if (passHash !== user.passHash) throw new Error("Falsches Passwort");
    const session = { name: user.name };
    localStorage.setItem(SESSION, JSON.stringify(session));
    sessionStorage.setItem(SESSION, JSON.stringify(session));
    return session;
  }

  function logout() {
    localStorage.removeItem(SESSION);
    sessionStorage.removeItem(SESSION);
  }

  seedOwner();
  return { current: current, register: register, login: login, logout: logout, isOwner: isOwner, seedOwner: seedOwner };
})();
