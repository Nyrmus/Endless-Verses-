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

  function setMode(mode) {
    const loginOn = mode === "login";
    tabLogin.classList.toggle("active", loginOn);
    tabRegister.classList.toggle("active", !loginOn);
    loginForm.classList.toggle("off", !loginOn);
    registerForm.classList.toggle("off", loginOn);
    loginForm.querySelectorAll("input").forEach((el) => {
      el.required = loginOn;
      el.disabled = !loginOn;
    });
    registerForm.querySelectorAll("input").forEach((el) => {
      el.required = !loginOn;
      el.disabled = loginOn;
    });
    if (msg) msg.textContent = "";
  }

  function show() {
    const user = EVAuth.current();
    if (user) {
      sessionEl.textContent = user.name;
      logoutBtn.hidden = false;
      playBtn.classList.remove("locked");
      playBtn.setAttribute("href", "play.html");
      loginForm.classList.add("off");
      registerForm.classList.add("off");
      tabLogin.classList.add("off");
      tabRegister.classList.add("off");
    } else {
      sessionEl.textContent = "Konto";
      logoutBtn.hidden = true;
      playBtn.classList.add("locked");
      playBtn.setAttribute("href", "#top");
      tabLogin.classList.remove("off");
      tabRegister.classList.remove("off");
      setMode("login");
    }
  }

  toggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    panel.hidden = !panel.hidden;
  });
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !e.target.closest(".account-wrap")) panel.hidden = true;
  });

  tabLogin.addEventListener("click", function (e) {
    e.preventDefault();
    setMode("login");
  });
  tabRegister.addEventListener("click", function (e) {
    e.preventDefault();
    setMode("register");
  });

  loginForm.addEventListener("submit", async function (e) {
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
  });

  registerForm.addEventListener("submit", async function (e) {
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
  });

  logoutBtn.addEventListener("click", function () {
    EVAuth.logout();
    show();
  });

  if (window.EVAuth && EVAuth.seedOwner) EVAuth.seedOwner();
  show();
})();
