(function () {
  const overlay = document.getElementById("accountOverlay");
  const openBtn = document.getElementById("accountOpen");
  const closeBtn = document.getElementById("accountClose");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const msg = document.getElementById("msg");
  const sessionEl = document.getElementById("session");
  const playBtn = document.getElementById("playBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  function open() {
    overlay.classList.add("on");
    overlay.setAttribute("aria-hidden", "false");
    if (!EVAuth.current()) {
      setTimeout(function () {
        document.getElementById("loginName").focus();
      }, 30);
    }
  }
  function close() {
    overlay.classList.remove("on");
    overlay.setAttribute("aria-hidden", "true");
  }

  function setMode(mode) {
    const loginOn = mode === "login";
    tabLogin.classList.toggle("active", loginOn);
    tabRegister.classList.toggle("active", !loginOn);
    loginForm.classList.toggle("off", !loginOn);
    registerForm.classList.toggle("off", loginOn);
    msg.textContent = "";
  }

  function show() {
    const user = EVAuth.current();
    if (user) {
      sessionEl.textContent = user.name;
      logoutBtn.classList.remove("off");
      loginForm.classList.add("off");
      registerForm.classList.add("off");
      tabLogin.classList.add("off");
      tabRegister.classList.add("off");
      playBtn.classList.remove("locked");
      playBtn.setAttribute("href", "play.html");
    } else {
      sessionEl.textContent = "Konto";
      logoutBtn.classList.add("off");
      tabLogin.classList.remove("off");
      tabRegister.classList.remove("off");
      setMode("login");
      playBtn.classList.add("locked");
      playBtn.setAttribute("href", "#top");
    }
  }

  openBtn.addEventListener("click", function (e) {
    e.preventDefault();
    open();
  });
  closeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    close();
  });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
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
    msg.textContent = "";
    try {
      await EVAuth.login(
        document.getElementById("loginName").value,
        document.getElementById("loginPass").value
      );
      show();
      close();
    } catch (err) {
      msg.textContent = err.message;
    }
  });

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    msg.textContent = "";
    try {
      await EVAuth.register(
        document.getElementById("regName").value,
        document.getElementById("regPass").value
      );
      show();
      close();
    } catch (err) {
      msg.textContent = err.message;
    }
  });

  logoutBtn.addEventListener("click", function () {
    EVAuth.logout();
    show();
  });

  EVAuth.seedOwner().then(show);
})();
