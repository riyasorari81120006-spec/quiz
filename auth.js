function showRegister() {
  const loginBox = document.getElementById("login-box");
  const registerBox = document.getElementById("register-box");
  
  loginBox.classList.add("slide-out-left");
  loginBox.classList.remove("slide-in-right");
  
  setTimeout(() => {
    loginBox.classList.add("hidden");
    registerBox.classList.remove("hidden");
    registerBox.classList.add("slide-in-right");
    registerBox.classList.remove("slide-out-left");
  }, 300);
}

function showLogin() {
  const loginBox = document.getElementById("login-box");
  const registerBox = document.getElementById("register-box");
  
  registerBox.classList.add("slide-out-right");
  registerBox.classList.remove("slide-in-left");
  
  setTimeout(() => {
    registerBox.classList.add("hidden");
    loginBox.classList.remove("hidden");
    loginBox.classList.add("slide-in-left");
    loginBox.classList.remove("slide-out-right");
  }, 300);
}

function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (name && email && password) {
    localStorage.setItem("user", JSON.stringify({ name, email, password }));
    alert("Registration Successful! Please Login.");
    showLogin();
  } else {
    alert("Please fill all fields.");
  }
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.email === email && user.password === password) {
    alert("Welcome " + user.name + "!");
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("branch-container").classList.remove("hidden");
  } else {
    alert("Invalid credentials or user not found.");
  }
}

