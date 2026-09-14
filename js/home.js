(function () {
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const msg = document.getElementById("msg");
  const sessionEl = document.getElementById("session");
  const playBtn = document.getElementById("playBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const gateHint = document.getElementById("gateHint");

  function show() {
    const user = EVAuth.current();
    if (user) {
      sessionEl.textContent = user.name;
      logoutBtn.hidden = false;
      playBtn.classList.remove("locked");
      playBtn.setAttribute("href", "play.html");
      gateHint.textContent = "Eingeloggt. Ins Spiel öffnet den Hub.";
    } else {
      sessionEl.textContent = "Gast";
      logoutBtn.hidden = true;
      playBtn.classList.add("locked");
      playBtn.setAttribute("href", "#konto");
      gateHint.textContent = "Zuerst registrieren oder einloggen, dann geht's in den Hub.";
    }
  }

  tabLogin.onclick = function () {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.hidden = false;
    registerForm.hidden = true;
    msg.textContent = "";
  };
  tabRegister.onclick = function () {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.hidden = false;
    loginForm.hidden = true;
    msg.textContent = "";
  };

  loginForm.onsubmit = async function (e) {
    e.preventDefault();
    try {
      await EVAuth.login(
        document.getElementById("loginName").value,
        document.getElementById("loginPass").value
      );
      show();
      location.href = "play.html";
    } catch (err) {
      msg.textContent = err.message;
    }
  };

  registerForm.onsubmit = async function (e) {
    e.preventDefault();
    try {
      await EVAuth.register(
        document.getElementById("regName").value,
        document.getElementById("regPass").value
      );
      show();
      location.href = "play.html";
    } catch (err) {
      msg.textContent = err.message;
    }
  };

  logoutBtn.onclick = function () {
    EVAuth.logout();
    show();
  };

  show();
})();
