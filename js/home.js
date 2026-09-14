(function () {
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const msg = document.getElementById("msg");
  const sessionEl = document.getElementById("session");
  const playBtn = document.getElementById("playBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  function show() {
    const user = EVAuth.current();
    if (user) {
      sessionEl.textContent = "Eingeloggt als " + user.name;
      logoutBtn.hidden = false;
      playBtn.style.pointerEvents = "auto";
      playBtn.style.opacity = "1";
    } else {
      sessionEl.textContent = "Nicht eingeloggt";
      logoutBtn.hidden = true;
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
