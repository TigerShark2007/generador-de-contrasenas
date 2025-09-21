const passwordField = document.getElementById("password");
const lengthField = document.getElementById("length");
const noteField = document.getElementById("note");
const historyList = document.getElementById("history");
const strengthFill = document.getElementById("strength-fill");

// Generar contraseña
function generatePassword() {
  const length = lengthField.value;
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

  let chars = "";
  if (document.getElementById("uppercase").checked) chars += upper;
  if (document.getElementById("lowercase").checked) chars += lower;
  if (document.getElementById("numbers").checked) chars += numbers;
  if (document.getElementById("symbols").checked) chars += symbols;

  if (!chars) {
    passwordField.value = "Selecciona al menos 1 opción";
    return;
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  passwordField.value = password;
  updateStrength(password);

  saveToHistory(password, noteField.value);
  noteField.value = ""; // limpiar nota después de usar
}

// Fuerza de la contraseña
function updateStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const width = (score / 4) * 100;
  strengthFill.style.width = width + "%";

  if (score <= 1) strengthFill.style.background = "red";
  else if (score === 2) strengthFill.style.background = "orange";
  else if (score === 3) strengthFill.style.background = "yellow";
  else strengthFill.style.background = "limegreen";
}

// Guardar historial con nota
function saveToHistory(password, note) {
  const li = document.createElement("li");
  const timestamp = new Date().toLocaleString();
  li.textContent = `${password} ${note ? " - " + note : ""} (${timestamp})`;
  historyList.prepend(li);
}

// Copiar y mostrar notificación
document.getElementById("copy").addEventListener("click", () => {
  if (!passwordField.value) return;

  navigator.clipboard.writeText(passwordField.value).then(() => {
    showToast("✅ Contraseña copiada");
  });
});

// Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 2500);
}

// Eventos
document.getElementById("generate").addEventListener("click", generatePassword);
document.getElementById("toggle-history").addEventListener("click", () => {
  document.getElementById("history-panel").classList.add("open");
});
document.getElementById("close-history").addEventListener("click", () => {
  document.getElementById("history-panel").classList.remove("open");
});
document.getElementById("clear-history").addEventListener("click", () => {
  historyList.innerHTML = "";
});
