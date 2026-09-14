(function () {
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const msg = document.getElementById("msg");
  const sessionEl = document.getElementById("session");
  const playBtn = document.getElementById("playBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const panel = document.getElementById("accountPanel");
  const toggle = document.getElementById("accountToggle");

  function show() {
    const user = EVAuth.current();
    if (user) {
      sessionEl.textContent = user.name;
      logoutBtn.hidden = false;
      playBtn.classList.remove("locked");
      playBtn.setAttribute("href", "play.html");
      loginForm.style.display = "none";
      registerForm.style.display = "none";
      tabLogin.style.display = "none";
      tabRegister.style.display = "none";
    } else {
      sessionEl.textContent = "Konto";
      logoutBtn.hidden = true;
      playBtn.classList.add("locked");
      playBtn.setAttribute("href", "#top");
      tabLogin.style.display = "";
      tabRegister.style.display = "";
      loginForm.style.display = "flex";
      registerForm.style.display = "none";
    }
  }

  toggle.onclick = function () {
    panel.hidden = !panel.hidden;
  };

  tabLogin.onclick = function () {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
    msg.textContent = "";
  };
  tabRegister.onclick = function () {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.style.display = "flex";
    loginForm.style.display = "none";
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
      panel.hidden = true;
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
      panel.hidden = true;
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
