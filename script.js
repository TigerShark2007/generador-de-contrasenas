// Generar contraseña
document.getElementById("generate").addEventListener("click", () => {
  const length = document.getElementById("length").value;
  const useUpper = document.getElementById("uppercase").checked;
  const useLower = document.getElementById("lowercase").checked;
  const useNumbers = document.getElementById("numbers").checked;
  const useSymbols = document.getElementById("symbols").checked;

  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_-+=<>?/{}[]";

  let allChars = "";
  if (useUpper) allChars += upper;
  if (useLower) allChars += lower;
  if (useNumbers) allChars += numbers;
  if (useSymbols) allChars += symbols;

  if (allChars === "") {
    alert("Selecciona al menos una opción.");
    return;
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  document.getElementById("password").value = password;

  checkStrength(password);
  savePassword(password);
});

// Copiar contraseña
document.getElementById("copy").addEventListener("click", () => {
  const passwordField = document.getElementById("password");
  if (passwordField.value === "") {
    alert("Primero genera una contraseña.");
    return;
  }
  passwordField.select();
  document.execCommand("copy");
  alert("Contraseña copiada al portapapeles!");
});

// Medidor de fuerza de contraseña
function checkStrength(password) {
  const strengthBar = document.getElementById("strengthBar");
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[\W_]/.test(password)) strength++;

  strengthBar.className = "";
  if (strength <= 1) strengthBar.classList.add("weak");
  else if (strength <= 3) strengthBar.classList.add("medium");
  else strengthBar.classList.add("strong");
}

// Guardar contraseña en historial (localStorage)
function savePassword(password) {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const now = new Date();
  const timestamp = now.toLocaleString();
  history.unshift({ password, timestamp });
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

// Renderizar historial
function renderHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const historyList = document.getElementById("history");
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.password} (${item.timestamp})`;
    li.addEventListener("click", () => {
      navigator.clipboard.writeText(item.password);
      alert("Contraseña copiada al portapapeles!");
    });
    historyList.appendChild(li);
  });
}

// Borrar historial
document.getElementById("clearHistory").addEventListener("click", () => {
  if (confirm("¿Seguro que quieres borrar todo el historial?")) {
    localStorage.removeItem("history");
    renderHistory();
  }
});

// Mostrar sidebar y overlay
document.getElementById("toggleHistory").addEventListener("click", () => {
  document.getElementById("historySidebar").classList.add("show");
  document.getElementById("overlay").classList.add("show");
});

// Cerrar sidebar y overlay
document.getElementById("closeHistory").addEventListener("click", () => {
  document.getElementById("historySidebar").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
});

document.getElementById("overlay").addEventListener("click", () => {
  document.getElementById("historySidebar").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
});

// Cargar historial al iniciar
window.onload = renderHistory;
